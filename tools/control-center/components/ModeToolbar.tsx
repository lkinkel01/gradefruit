export type WorkspaceMode = "normal" | "edit" | "reorder";

export function ModeToolbar({ mode, onModeChange, addLabel, onAdd }: {
  mode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
  addLabel: string;
  onAdd: () => void;
}) {
  if (mode === "reorder") {
    return <div className="mode-actions"><button className="button" type="button" onClick={() => onModeChange("normal")}>Fertig</button></div>;
  }
  if (mode === "edit") {
    return (
      <div className="mode-actions">
        <button className="button" type="button" onClick={onAdd}>{addLabel}</button>
        <button className="button secondary" type="button" onClick={() => onModeChange("normal")}>Fertig</button>
      </div>
    );
  }
  return (
    <div className="mode-actions">
      <button className="button" type="button" onClick={onAdd}>{addLabel}</button>
      <button className="button secondary" type="button" onClick={() => onModeChange("edit")}>Bearbeiten</button>
      <button className="button secondary" type="button" onClick={() => onModeChange("reorder")}>Reihenfolge bearbeiten</button>
    </div>
  );
}
