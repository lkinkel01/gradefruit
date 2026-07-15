import type { KeyboardEvent } from "react";

export function SortHandle({ label, canMoveUp, canMoveDown, onMoveUp, onMoveDown }: {
  label: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  function keydown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowUp" && canMoveUp) { event.preventDefault(); onMoveUp(); }
    if (event.key === "ArrowDown" && canMoveDown) { event.preventDefault(); onMoveDown(); }
  }
  return (
    <>
      <button className="drag-handle" type="button" aria-label={`${label} ziehen. Mit Pfeiltasten sortieren.`} title="Ziehen oder Pfeiltasten verwenden" onKeyDown={keydown}>
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <circle cx="7" cy="5" r="1.2" /><circle cx="13" cy="5" r="1.2" />
          <circle cx="7" cy="10" r="1.2" /><circle cx="13" cy="10" r="1.2" />
          <circle cx="7" cy="15" r="1.2" /><circle cx="13" cy="15" r="1.2" />
        </svg>
      </button>
      <span className="mobile-sort-controls">
        <button type="button" disabled={!canMoveUp} onClick={onMoveUp}>Nach oben</button>
        <button type="button" disabled={!canMoveDown} onClick={onMoveDown}>Nach unten</button>
      </span>
    </>
  );
}

export function Disclosure({ expanded }: { expanded: boolean }) {
  return (
    <svg className={expanded ? "disclosure expanded" : "disclosure"} aria-hidden="true" viewBox="0 0 24 24">
      <path d="m8 10 4 4 4-4" />
    </svg>
  );
}
