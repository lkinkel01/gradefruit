"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./client-api";
import type {
  IdeaConversionInput,
  WorkspaceData,
  WorkspaceRemoval,
  WorkspaceVisibleData,
} from "./types";

function visible(workspace: WorkspaceData): WorkspaceVisibleData {
  return {
    tasks: workspace.tasks,
    ideas: workspace.ideas,
    milestones: workspace.milestones,
    vision: workspace.vision,
    links: workspace.links,
  };
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setWorkspace(await api<WorkspaceData>("/api/workspace"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Der Workspace konnte nicht geladen werden.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api<WorkspaceData>("/api/workspace")
      .then((data) => { if (!cancelled) setWorkspace(data); })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Der Workspace konnte nicht geladen werden.");
      });
    return () => { cancelled = true; };
  }, []);

  async function save(next: WorkspaceVisibleData, message: string, removals: WorkspaceRemoval[] = []): Promise<boolean> {
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const saved = await api<WorkspaceData>("/api/workspace", {
        method: "PUT",
        body: JSON.stringify({ workspace: next, removals }),
      });
      setWorkspace(saved);
      setNotice(message);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Die Änderung konnte nicht gespeichert werden.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function convertIdea(input: IdeaConversionInput): Promise<boolean> {
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const saved = await api<WorkspaceData>("/api/workspace/convert-idea", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setWorkspace(saved);
      setNotice("Die Idee wurde als Aufgabe gespeichert.");
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Die Idee konnte nicht umgewandelt werden und bleibt erhalten.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return {
    workspace,
    visible: workspace ? visible(workspace) : null,
    notice,
    error,
    busy,
    load,
    save,
    convertIdea,
  };
}
