import { assertSameOrigin, requireWorkspaceUser } from "@/lib/auth";
import { apiError, jsonBody, ok } from "@/lib/http";
import { convertIdeaToTask } from "@/lib/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { client } = await requireWorkspaceUser();
    return ok(await convertIdeaToTask(client, await jsonBody(request)));
  } catch (error) {
    return apiError(error);
  }
}
