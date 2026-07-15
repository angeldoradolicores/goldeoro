export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'goldeoro-store',
    timestamp: new Date().toISOString(),
  })
}
