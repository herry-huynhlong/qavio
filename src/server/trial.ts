import { randomBytes, createHash, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { hmac, equalSecret } from "./crypto";
import { HttpError, clientBucket, guard, readJson, response } from "./http";
import { transaction } from "./db";
import { rateLimit } from "./rate-limit";
import { trialInput, trialResultSchema } from "@/lib/trial-contract";
const flowCookie = "qavio_trial_flow",
  grantCookie = "qavio_trial_grant";
const cookieOptions = {
  httpOnly: true,
  secure:
    process.env.QAVIO_DEPLOYMENT_ENV === "production" ||
    process.env.APP_ORIGIN?.startsWith("https://") === true,
  sameSite: "lax" as const,
  path: "/api/trial",
  maxAge: 600,
};
const grantSchema = z.object({
  email: z.email(),
  ownerName: z.string(),
  verificationToken: z.string(),
  expiresAt: z.iso.datetime(),
});
const browserInput = trialInput
  .omit({ verificationToken: true })
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
export function trialConfigured() {
  return (
    process.env.QAVIO_TRIAL_ENABLED === "true" &&
    Boolean(
      process.env.QUANPILOT_TRIAL_API_ORIGIN &&
      process.env.QUANPILOT_TRIAL_PUBLIC_ORIGIN &&
      (process.env.QUANPILOT_QAVIO_TRIAL_SECRET?.length || 0) >= 32,
    )
  );
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
  operation: "google-start" | "google-exchange" | "register",
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
function encodeGrant(data: z.infer<typeof grantSchema>) {
  const value = Buffer.from(JSON.stringify(data)).toString("base64url");
  return value + "." + hmac("trial-grant:" + value);
}
export async function readTrialGrant() {
  const value = (await cookies()).get(grantCookie)?.value || "",
    parts = value.split(".");
  if (
    parts.length !== 2 ||
    !equalSecret(hmac("trial-grant:" + parts[0]), parts[1])
  )
    return null;
  try {
    const data = grantSchema.parse(
      JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")),
    );
    return new Date(data.expiresAt) > new Date() ? data : null;
  } catch {
    return null;
  }
}
export async function startTrialGoogle(request: Request) {
  guard(request, trialConfigured());
  const body = z
    .object({ website: z.literal("") })
    .strict()
    .safeParse(await readJson(request, 1024));
  if (!body.success) throw new HttpError(422, "SUBMISSION_REJECTED");
  const bucket = clientBucket(request);
  await transaction((tx) => rateLimit(tx, "trial:oauth:" + bucket, 10, 900000));
  const flow = randomBytes(32).toString("hex"),
    data = z
      .object({ url: z.url() })
      .parse(
        await callTrial(
          "google-start",
          { flowHash: hmac("trial-flow:" + flow) },
          bucket,
        ),
      );
  const u = new URL(data.url);
  if (
    u.protocol !== "https:" ||
    u.hostname !== "accounts.google.com" ||
    u.pathname !== "/o/oauth2/v2/auth"
  )
    throw new HttpError(503, "INVALID_OAUTH_DESTINATION");
  (await cookies()).set(flowCookie, flow, cookieOptions);
  return response(data);
}
export async function finishTrialGoogle(request: Request) {
  const jar = await cookies(),
    flow = jar.get(flowCookie)?.value,
    ticket = new URL(request.url).searchParams.get("ticket") || "";
  if (!flow || !/^[a-f0-9]{64}$/.test(ticket))
    throw new HttpError(403, "INVALID_OAUTH_FLOW");
  const data = grantSchema.parse(
    await callTrial(
      "google-exchange",
      { ticket, flowHash: hmac("trial-flow:" + flow) },
      clientBucket(request),
    ),
  );
  jar.set(grantCookie, encodeGrant(data), cookieOptions);
  jar.set(flowCookie, "", { ...cookieOptions, maxAge: 0 });
  return data;
}
export async function submitTrial(request: Request) {
  guard(request, trialConfigured());
  const bucket = clientBucket(request);
  await transaction((tx) =>
    rateLimit(tx, "trial:submit:" + bucket, 30, 900000),
  );
  const grant = await readTrialGrant();
  if (!grant) throw new HttpError(403, "EMAIL_VERIFICATION_REQUIRED");
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
  if (input.data.email !== grant.email)
    throw new HttpError(403, "EMAIL_VERIFICATION_REQUIRED");
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
      { ...data, verificationToken: grant.verificationToken },
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
