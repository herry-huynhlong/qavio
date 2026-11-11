import { trialConfigured } from "@/server/trial";
import { response, failure } from "@/server/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return response({ enabled: trialConfigured() });
  } catch (e) {
    return failure(e);
  }
}
