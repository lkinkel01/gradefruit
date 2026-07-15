"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function WorkspaceModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>("input, textarea, select, button, a[href]");
    first?.focus();
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", handleKeydown);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.classList.remove("modal-open");
      previous?.focus();
    };
  }, []);

  return createPortal(
    <div className="workspace-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="workspace-modal" role="dialog" aria-modal="true" aria-labelledby="workspace-modal-title" ref={panelRef}>
        <header className="workspace-modal-header">
          <h2 id="workspace-modal-title">{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Schließen">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <div className="workspace-modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
