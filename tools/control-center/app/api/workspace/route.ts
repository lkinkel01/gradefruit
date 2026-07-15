import { assertSameOrigin, requireWorkspaceUser } from "@/lib/auth";
import { apiError, jsonBody, ok } from "@/lib/http";
import { readWorkspace, saveWorkspace } from "@/lib/workspace";
import { record } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    void request;
    const { client } = await requireWorkspaceUser();
    return ok(await readWorkspace(client));
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    const { client, ownerId } = await requireWorkspaceUser();
    const body = record(await jsonBody(request), "Workspace speichern");
    return ok(await saveWorkspace(client, ownerId, body.workspace, body.removals));
  } catch (error) {
    return apiError(error);
  }
}
