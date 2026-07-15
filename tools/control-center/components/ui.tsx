import type { ReactNode } from "react";

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

export function Notice({ message, error = false }: { message: string; error?: boolean }) {
  if (!message) return null;
  return <div className={error ? "notice error" : "notice success"} role={error ? "alert" : "status"}>{message}</div>;
}

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return <label className={`field ${className}`}><span>{label}</span>{children}{hint ? <small>{hint}</small> : null}</label>;
}

export function Loading() {
  return <div className="loading" role="status">Workspace wird geladen …</div>;
}
