import { analyseLogs } from "@/lib/analyseLogs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = body?.input;

    if (!input || typeof input !== "string") {
      return Response.json({ error: "Log input is required" }, { status: 400 });
    }

    const result = analyseLogs(input);

    return Response.json({ result });
  } catch {
    return Response.json({ error: "Unable to analyse logs" }, { status: 500 });
  }
}
