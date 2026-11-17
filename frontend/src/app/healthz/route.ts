/** Liveness probe for Docker / load balancers. */
export function GET() {
  return Response.json({ status: "ok", service: "yasun-studio-web" });
}
