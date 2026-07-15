import { assertSameOrigin, requireWorkspaceUser } from "@/lib/auth";
import { apiError, jsonBody, ok } from "@/lib/http";
import { confirmLocalImport } from "@/lib/import-workspace";
import { record } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { client, ownerId } = await requireWorkspaceUser();
    const body = record(await jsonBody(request, 2_000_000), "Import bestätigen");
    return ok(await confirmLocalImport(client, ownerId, body.source));
  } catch (error) {
    return apiError(error);
  }
}
