import { assertSameOrigin, requireWorkspaceUser } from "@/lib/auth";
import { apiError, jsonBody, ok } from "@/lib/http";
import { previewLocalImport } from "@/lib/import-workspace";
import { record } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { client } = await requireWorkspaceUser();
    const body = record(await jsonBody(request, 2_000_000), "Importvorschau");
    return ok(await previewLocalImport(client, body.source));
  } catch (error) {
    return apiError(error);
  }
}
