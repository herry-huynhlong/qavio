import { finishTrialGoogle } from "@/server/trial";
import { appOrigin } from "@/server/config";
export const runtime = "nodejs";
export async function GET(request: Request) {
  let success = false;
  try {
    await finishTrialGoogle(request);
    success = true;
  } catch {}
  return new Response(null, {
    status: 303,
    headers: {
      Location: appOrigin() + "/trial" + (success ? "" : "?auth=failed"),
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
