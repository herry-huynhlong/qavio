import { randomBytes, createHash, createHmac } from "node:crypto";
import { z } from "zod";
import { hmac } from "./crypto";
import { HttpError, clientBucket, guard, readJson, response } from "./http";
import { transaction } from "./db";
import { rateLimit } from "./rate-limit";
import { trialInput, trialResultSchema } from "@/lib/trial-contract";
const browserInput = trialInput
  .extend({
    confirmPassword: z.string(),
    website: z.string().max(200),
    startedAt: z.number().int(),
  })
  .strict()
  .refine((x) => x.password === x.confirmPassword, {
    path: ["confirmPassword"],
    message: "Xác nhận mật khẩu không khớp.",
  });
export function trialConfigurationStatus() {
  if (process.env.QAVIO_TRIAL_ENABLED !== "true")
    return { enabled: false, code: "TRIAL_DISABLED" as const };
  if (
    !process.env.QUANPILOT_TRIAL_API_ORIGIN ||
    !process.env.QUANPILOT_TRIAL_PUBLIC_ORIGIN ||
    (process.env.QUANPILOT_QAVIO_TRIAL_SECRET?.length || 0) < 32
  )
    return { enabled: false, code: "TRIAL_NOT_CONFIGURED" as const };
  return { enabled: true as const };
}
export function trialConfigured() {
  return trialConfigurationStatus().enabled;
}
function origin(name: string) {
  const u = new URL(process.env[name] || "invalid:");
  if (
    u.pathname !== "/" ||
    u.search ||
    u.hash ||
    u.username ||
    u.password ||
    !(
      u.protocol === "https:" ||
      (u.protocol === "http:" &&
        ["127.0.0.1", "localhost"].includes(u.hostname))
    )
  )
    throw new HttpError(503, "TRIAL_NOT_CONFIGURED");
  return u.origin;
}
export async function callTrial(
  operation: "register",
  input: unknown,
  bucket: string,
  key = "",
) {
  if (!trialConfigured()) throw new HttpError(503, "TRIAL_DISABLED");
  const pathname = "/api/integrations/qavio/trial/" + operation,
    stamp = String(Date.now()),
    nonce = randomBytes(16).toString("hex"),
    body = JSON.stringify(input),
    client = createHash("sha256")
      .update(hmac("trial-ip:" + bucket))
      .digest("hex");
  const sign = createHmac("sha256", process.env.QUANPILOT_QAVIO_TRIAL_SECRET!)
    .update(
      [
        "POST",
        pathname,
        stamp,
        nonce,
        client,
        key,
        createHash("sha256").update(body).digest("hex"),
      ].join("\n"),
    )
    .digest("hex");
  let upstream: Response;
  try {
    upstream = await fetch(origin("QUANPILOT_TRIAL_API_ORIGIN") + pathname, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(25000),
      headers: {
        "content-type": "application/json",
        "x-qavio-timestamp": stamp,
        "x-qavio-nonce": nonce,
        "x-qavio-client-bucket": client,
        "x-qavio-signature": sign,
        ...(key ? { "idempotency-key": key } : {}),
      },
      body,
      cache: "no-store",
    });
  } catch {
    throw new HttpError(503, "TRIAL_RETRY_SAME_REQUEST");
  }
  let result: unknown;
  try {
    const text = await upstream.text();
    if (Buffer.byteLength(text) > 32768) throw Error();
    result = JSON.parse(text);
  } catch {
    throw new HttpError(503, "TRIAL_UPSTREAM_UNAVAILABLE");
  }
  if (!upstream.ok) {
    const code = z
      .object({ code: z.string().regex(/^[A-Z_]+$/) })
      .safeParse(result);
    throw new HttpError(
      [400, 401, 403, 409, 413, 422, 429, 503].includes(upstream.status)
        ? upstream.status
        : 503,
      code.success ? code.data.code : "TRIAL_UPSTREAM_UNAVAILABLE",
    );
  }
  return result;
}
export async function submitTrial(request: Request) {
  guard(request, trialConfigured());
  const bucket = clientBucket(request);
  await transaction((tx) =>
    rateLimit(tx, "trial:submit:" + bucket, 30, 900000),
  );
  const input = browserInput.safeParse(
    await readJson(request, 3 * 1024 * 1024),
  );
  if (!input.success)
    return response(
      {
        ok: false,
        code: "TRIAL_VALIDATION_ERROR",
        fields: input.error.flatten().fieldErrors,
      },
      422,
    );
  if (
    input.data.website ||
    Date.now() - input.data.startedAt < 1200 ||
    Date.now() - input.data.startedAt > 7200000
  )
    throw new HttpError(422, "SUBMISSION_REJECTED");
  const { confirmPassword, website, startedAt, ...data } = input.data;
  void confirmPassword;
  void website;
  void startedAt;
  const result = trialResultSchema.parse(
    await callTrial(
      "register",
      data,
      bucket,
      request.headers.get("idempotency-key") || "",
    ),
  );
  const target = new URL(result.loginUrl),
    expected = origin("QUANPILOT_TRIAL_PUBLIC_ORIGIN");
  if (
    target.origin !== expected ||
    target.pathname !== "/" + encodeURIComponent(data.slug) + "/login" ||
    target.search !== "?role=OWNER" ||
    target.hash ||
    target.username ||
    target.password
  )
    throw new HttpError(503, "INVALID_LOGIN_DESTINATION");
  return response({ ok: true, result });
}
