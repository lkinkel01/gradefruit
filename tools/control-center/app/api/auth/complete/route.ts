import { apiError, ok } from "@/lib/http";
import { requireWorkspaceUser } from "@/lib/auth";

export async function GET() {
  try {
    const { ownerId } = await requireWorkspaceUser();
    return ok({ ownerId });
  } catch (error) {
    return apiError(error);
  }
}
