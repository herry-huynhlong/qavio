import { readTrialGrant, trialConfigured } from "@/server/trial";
import { response, failure } from "@/server/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const grant = await readTrialGrant();
    return response({
      enabled: trialConfigured(),
      identity: grant
        ? { email: grant.email, ownerName: grant.ownerName }
        : null,
    });
  } catch (e) {
    return failure(e);
  }
}
