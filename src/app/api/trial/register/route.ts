import { submitTrial } from "@/server/trial";
import { failure } from "@/server/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    return await submitTrial(request);
  } catch (e) {
    return failure(e);
  }
}
