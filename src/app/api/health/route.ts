export const dynamic = "force-dynamic";

export function GET() {
  // Liveness only; use /api/ready for environment/database/media readiness.
  return Response.json({ status: "ok", service: "qavio" }, {
    headers: { "Cache-Control": "no-store" },
  });
}
