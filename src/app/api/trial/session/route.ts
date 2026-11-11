import { trialConfigurationStatus } from "@/server/trial";
import { response, failure } from "@/server/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return response(trialConfigurationStatus());
  } catch (e) {
    return failure(e);
  }
}
