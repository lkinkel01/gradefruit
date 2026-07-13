# HANDOUT — Übergabe für die nächste Claude-Code-Session

> Zweck: Diese Datei überbrückt den Chat-Wechsel — nur Start-Anleitung und
> nächste Schritte. Alles andere steht genau einmal woanders:
> Regeln in [CLAUDE.md](CLAUDE.md) (lädt automatisch, enthält die
> Dokumenten-Landkarte), Produkt in [PRODUCT.md](PRODUCT.md), Design in
> [DESIGN.md](DESIGN.md), Stand + Historie in
> [PROJECT_STATUS.md](PROJECT_STATUS.md).

## So startest du die neue Session (Leon)

1. Neue Claude-Code-Session **im Projektordner** starten (im Desktop-App den
   Gradefruit-Ordner als Projekt öffnen). Nur dann
   lädt die CLAUDE.md mit allen Projektregeln automatisch.
2. Erste Nachricht (kopierbar):
   > „Lies HANDOUT.md und PROJECT_STATUS.md. Dann mach weiter mit: [dein Ziel,
   > z. B. Verkaufsstart-Checkliste / Sprint 12 / hier sind meine
   > Impressums-Daten …]"
3. Die Sprint-Prompts der letzten Sessions haben sehr gut funktioniert —
   gleiches Format weiterverwenden (Ziel, nummerierte Punkte, Verbote,
   „Nach Abschluss: Typecheck, Build, Browser testen, Commit, Push").

## Stand

Sprints 01–10 plus Fundament-Sprint sind abgeschlossen; alles bis Sprint 10
ist live auf gradefruit.de. Der Fundament-Sprint (PRODUCT.md, DESIGN.md,
Doku-Konsolidierung) liegt lokal vor und wartet auf Leons Freigabe zum
Commit. Details: PROJECT_STATUS.md → „Aktueller Stand (Kurzfassung)".

## 🔴 Nächster großer Block: Verkaufsstart (Leon + Claude gemeinsam)

**Stripe läuft noch im TESTMODUS — niemand kann echt bezahlen.** Reihenfolge:

1. **Platzhalter füllen** (Claude trägt ein, sobald Leon die Daten nennt):
   Impressum, `/agb`, `/widerruf` enthalten rote Felder — vollständiger Name,
   Anschrift, E-Mail, USt-Status, Zugangs-Enddatum (z. B. 31.07.2027),
   AGB-Stand-Datum. **Offene Frage an Leon: Kleinunternehmer nach § 19 UStG?**
   Falls ja: „inkl. MwSt." überall gegen den § 19-Hinweis tauschen
   (CheckoutModal.tsx, LandingPage.tsx Kurse-Sektion, AGB § 5).
2. **Juristische Prüfung** der drei Rechtstexte (eRecht24 / IT-Recht Kanzlei /
   Anwalt) — die Texte sind sorgfältige Entwürfe, keine Rechtsberatung.
3. **Stripe TEST → LIVE** (Leon im Stripe-Dashboard, ~20 Min):
   a) Schalter auf „Live", ggf. Konto-Verifizierung abschließen.
   b) Live-Produkte + Preise anlegen: GK 79 € einmalig + 14,90 €/Monat,
      LK 99 € einmalig + 17,90 €/Monat → die 4 `price_…`-IDs kopieren.
   c) Live-Webhook: Entwickler → Webhooks → `https://www.gradefruit.de/api/stripe/webhook`
      mit Ereignissen `checkout.session.completed`,
      `customer.subscription.created/updated/deleted`, `charge.refunded`
      → `whsec_…` kopieren.
   d) Vercel → Environment Variables auf Live umstellen: `STRIPE_SECRET_KEY`
      (sk_live), `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ONE_TIME`,
      `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_LK_ONE_TIME`,
      `STRIPE_PRICE_LK_MONTHLY` → Redeploy.
   e) Echter Testkauf mit eigener Karte → Freischaltung prüfen → in Stripe
      erstatten → prüfen, dass der Zugang wieder entzogen wird.
   Claude verifiziert die Schritte von lokal mit (read-only Skripte).

## Weitere offene Punkte & Sprint-Ideen

Vollständig gepflegt in **PROJECT_STATUS.md** („Bekannte Probleme" und
„Nächste sinnvolle Schritte") — dort stehen u. a. ElevenLabs-Kontingent,
Prüfungstermin (`src/lib/exam.ts`), Zähler-Angleichung 79↔133 und die
Sprint-Kandidaten (Spaced Repetition, LK-Reels, Content-Ausbau).

## Bewährte Arbeitsweise (Kurzfassung)

- Pro Sprint: umsetzen → Verifikations-Checkliste aus CLAUDE.md (Typecheck,
  Build, Browser hell/dunkel/mobil) → gezielt `git add <dateien>` → Commit →
  Push nur auf Leons Ansage (Vercel deployt automatisch).
- UI-Tests mit Login: `scripts/create-test-user.mjs <zweck>` /
  `scripts/delete-test-user.mjs <zweck>` (siehe CLAUDE.md → Verifikation).
- Ehrlichkeit ist Produktprinzip (PRODUCT.md): keine erfundenen Zahlen,
  Bewertungen, Termine oder Features; „bald" klar kennzeichnen.
