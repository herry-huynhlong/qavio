export const dynamic = "force-dynamic";

export function GET() {
  // Liveness only in phase A: there is no database or mail provider yet.
  return Response.json({ status: "ok", service: "qavio" }, {
    headers: { "Cache-Control": "no-store" },
  });
}
