"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Notice } from "./ui";

type Stage = "password" | "enroll" | "verify";

function qrImageSource(value: string): string {
  const normalized = value.trim();
  if (normalized.startsWith("data:image/svg+xml")) return normalized;
  if (normalized.startsWith("<svg") && normalized.endsWith("</svg>")) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(normalized)}`;
  }
  return "";
}

export function LoginClient({ configured, initialMessage = "" }: { configured: boolean; initialMessage?: string }) {
  const [stage, setStage] = useState<Stage>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function finishLogin() {
    const response = await fetch("/api/auth/complete", { cache: "no-store", credentials: "same-origin" });
    const payload = await response.json() as { ok: boolean; error?: string };
    if (!response.ok || !payload.ok) {
      await createClient().auth.signOut();
      throw new Error(payload.error || "Dieses Konto ist für den Workspace nicht freigeschaltet.");
    }
    window.location.assign("/overview");
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;
    setBusy(true);
    setError("");
    try {
      const client = createClient();
      const { error: signInError } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) throw new Error("E-Mail oder Passwort ist nicht korrekt.");
      const identity = await fetch("/api/auth/identity", { cache: "no-store", credentials: "same-origin" });
      if (!identity.ok) {
        await client.auth.signOut();
        throw new Error("Dieses Konto ist für den Gradefruit Workspace nicht freigeschaltet.");
      }
      const { data: assurance } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assurance?.currentLevel === "aal2") {
        await finishLogin();
        return;
      }
      const { data: factors, error: factorsError } = await client.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      const verified = factors.totp.find((factor) => factor.status === "verified");
      if (verified) {
        setFactorId(verified.id);
        setStage("verify");
        return;
      }
      for (const factor of factors.all.filter((item) => item.status === "unverified")) {
        await client.auth.mfa.unenroll({ factorId: factor.id });
      }
      const { data: enrollment, error: enrollmentError } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "Gradefruit Workspace" });
      if (enrollmentError) throw enrollmentError;
      setFactorId(enrollment.id);
      setQrCode(enrollment.totp.qr_code);
      setSecret(enrollment.totp.secret);
      setStage("enroll");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Die Anmeldung ist fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function submitTotp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const client = createClient();
      const { error: verifyError } = await client.auth.mfa.challengeAndVerify({ factorId, code: code.replace(/\s/g, "") });
      if (verifyError) throw new Error("Der sechsstellige Code ist nicht korrekt oder abgelaufen.");
      await finishLogin();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Der zweite Faktor konnte nicht bestätigt werden.");
    } finally {
      setBusy(false);
    }
  }

  const qrSource = qrImageSource(qrCode);

  return (
    <section className="login-panel" aria-labelledby="login-title">
      <div className="login-heading">
        <p className="eyebrow">Privater Bereich</p>
        <h1 id="login-title">{stage === "password" ? "Anmelden" : stage === "enroll" ? "Zwei-Faktor-Schutz einrichten" : "Sicherheitscode eingeben"}</h1>
        <p>{stage === "password" ? "Melde dich mit deinem einzigen freigeschalteten Workspace-Konto an." : stage === "enroll" ? "Scanne den Code einmal mit deiner Authenticator-App und bestätige ihn danach." : "Öffne deine Authenticator-App und gib den aktuellen Code ein."}</p>
      </div>
      {initialMessage ? <Notice message={initialMessage} error /> : null}
      {!configured ? <Notice message="Der Workspace ist noch nicht mit seinem separaten Supabase-Projekt verbunden. Folge zuerst der Einrichtungsanleitung." error /> : null}
      <Notice message={error} error />
      {stage === "password" ? (
        <form className="login-form" onSubmit={(event) => void submitPassword(event)}>
          <label className="field"><span>E-Mail</span><input type="email" autoComplete="username" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} disabled={!configured || busy} /></label>
          <label className="field"><span>Passwort</span><input type="password" autoComplete="current-password" required maxLength={512} value={password} onChange={(event) => setPassword(event.target.value)} disabled={!configured || busy} /></label>
          <button className="button" type="submit" disabled={!configured || busy}>{busy ? "Wird geprüft …" : "Weiter"}</button>
        </form>
      ) : (
        <form className="login-form" onSubmit={(event) => void submitTotp(event)}>
          {stage === "enroll" ? <div className="totp-setup">{qrSource ? <>
            {/* Supabase returns this private, short-lived QR code as inline SVG data. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSource} alt="QR-Code für die Authenticator-App" width="220" height="220" />
          </> : <Notice message="Der QR-Code konnte nicht dargestellt werden. Nutze den manuellen Code darunter." error />}<details><summary>Code stattdessen manuell eingeben</summary><code>{secret}</code></details></div> : null}
          <label className="field"><span>Sechsstelliger Code</span><input className="totp-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} disabled={busy} /></label>
          <button className="button" type="submit" disabled={busy || code.length !== 6}>{busy ? "Wird geprüft …" : stage === "enroll" ? "Einrichtung abschließen" : "Anmelden"}</button>
        </form>
      )}
    </section>
  );
}
