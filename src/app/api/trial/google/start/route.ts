import { startTrialGoogle } from "@/server/trial";
import { failure } from "@/server/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    return await startTrialGoogle(request);
  } catch (e) {
    return failure(e);
  }
}
