import { requireWorkspaceIdentity } from "@/lib/auth";
import { apiError, ok } from "@/lib/http";

export async function GET() {
  try {
    await requireWorkspaceIdentity();
    return ok({ allowed: true });
  } catch (error) {
    return apiError(error);
  }
}
