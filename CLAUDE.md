@AGENTS.md

# Gradefruit

Lernplattform für das **schriftliche Mathe-Abitur Hessen 2027**. Ziel: Schüler:innen
kaufen Zugang (GK oder LK) und üben mit Aufgaben, Lösungen, KI-Hilfe und Erklärvideos.

> Hinweis: `@AGENTS.md` oben warnt, dass diese **Next.js-Version von der Standard-Version abweicht** – vor Code-Änderungen die Doku in `node_modules/next/dist/docs/` beachten.
>
> **Aktueller Stand, offene Aufgaben & Übergabe an ChatGPT: [PROJECT_STATUS.md](PROJECT_STATUS.md)** (nach größeren Änderungen aktualisieren). Diese CLAUDE.md = dauerhafte Regeln/Referenz; PROJECT_STATUS.md = aktueller Stand.

---

## Wie ich mit Leon arbeite (wichtig)

- Leon ist **nicht-technisch**. Erklär einfach, auf **Deutsch**, per **„du"**, in **kleinen Schritten**. Kein Fachjargon ohne kurze Erklärung.
- **Leon kann KEINE Dateien öffnen oder bearbeiten.** Ich (Claude) ändere alle Dateien selbst. Sag ihm nie „öffne Datei X und ändere Zeile Y".
- Leon **kann** Web-Dashboards bedienen: Stripe, Supabase, ElevenLabs, Vercel, GitHub, Hostinger. Dafür darf ich ihm Klick-Anleitungen geben.
- Muss Leon einen Datei-Inhalt sehen? → **committen + pushen**, dann auf GitHubs „Copy raw file" verweisen.
- **Nur committen, wenn Leon ausdrücklich darum bittet.** Sonst Änderungen nur lokal lassen.

## Sicherheitsregeln (NICHT verhandelbar)

- Geheime Schlüssel **immer in `.env.local`**, **niemals** in sichtbaren Code und **niemals** mit `NEXT_PUBLIC_`-Präfix (sonst landen sie im Browser).
- `ANTHROPIC_API_KEY` und `ELEVENLABS_API_KEY` sind **server-only** – nie im Browser.
- **Kartendaten fasst niemand selbst an – das macht alles Stripe.**
- Secrets in Vercels **verschlüsseltem Env-Speicher** einzutragen ist der **richtige, sichere** Ort – das ist NICHT „sichtbarer Code".
- **Beim Prüfen per lokalem Skript:** Secrets über `node --env-file=.env.local …` laden, damit die **Werte nie** in den Chat geraten. Beim Inspizieren von `.env.local` nur die **Namen** lesen (z. B. per `grep`), nie die Werte.

---

## Stack

- **Next.js 16.2.9** (App Router, Turbopack) + **TypeScript** — abweichende Version, siehe `@AGENTS.md`
- **CSS Modules** zum Stylen – **kein Tailwind**
- **Supabase**: Auth (E-Mail+Passwort **und Google-OAuth – aktiv seit 07/2026**) + Postgres mit **RLS**
- **Stripe** im **TEST-/Sandbox-Modus**
- **ElevenLabs** für Text-to-Speech (Erklärvideo-Stimme)

## Umgebung & Befehle (macOS, zsh)

- node/npm liegen unter `/opt/homebrew/bin` → in Skripten zuerst `eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null;`
- **Bash merkt sich das Verzeichnis NICHT zwischen Aufrufen.** Standard ist `/Users/leonkinkel/Documents`. Darum in **jedem** Befehl `cd /Users/leonkinkel/Gradefruit`.
- **Build:**
  ```
  eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null; unset ANTHROPIC_API_KEY && cd /Users/leonkinkel/Gradefruit && npm run build
  ```
  (`unset ANTHROPIC_API_KEY` ist nötig, sonst bricht der Build ab.)
- **Webhook-Check:** `node --env-file=.env.local scripts/check-webhook.mjs` → gibt am Ende `VERDICT:` aus.

## Projektstruktur

- `src/app/` – Seiten (App Router) + API-Routen unter `src/app/api/…`
- `src/components/` – UI-Komponenten, jeweils mit `*.module.css`
- `src/lib/` – Server-Helfer: `stripe.ts` (`getStripe()`), `supabaseAdmin.ts` (`createAdminClient()`)
- `scripts/` – Hilfsskripte (`generate-audio.mjs`, `check-webhook.mjs`)
- `src/app/globals.css` – CSS-Variablen; Dark Mode über `body.dark`

## CSS-Konventionen

- Dark Mode = `body.dark` überschreibt die CSS-Variablen aus `:root`.
- Globale Klassen (z. B. `.btn`) aus einem Modul heraus ansprechen: `:global(.btn)` bzw. `.container :global(.btn)`.
- Mobiles Menü: Sidebar wird ab `≤900px` zur einschiebbaren Schublade über `body.navopen`.
- **Keine Emojis im UI** – cleaner, Apple-artiger Look.

---

## Datenbank (Supabase)

Tabelle **`purchases`** (RLS aktiv) – Spalten:
`id, user_id, course_id, status, purchased_at, plan, stripe_customer_id, stripe_subscription_id, stripe_checkout_session_id, current_period_end, updated_at`
→ **Zeitstempel heißt `purchased_at`, NICHT `created_at`.**

## Bezahlung (Stripe, Testmodus)

- **Zwei Kurse:** GK (`mathe-gk`) und LK (`mathe-lk`), je eigene Bezahlschranke.
- **Checkout:** `src/app/api/checkout/route.ts` (Node-Runtime, Bearer-Auth). Setzt `client_reference_id = user.id`, `metadata = { user_id, course_id, plan }`, `success_url = …/?checkout=success`.
- **Webhook:** `src/app/api/stripe/webhook/route.ts` (Node-Runtime). Nutzt **„Snapshot"-Events** (klassisch v1) + `stripe.webhooks.constructEvent` + `event.data.object`. Bei `checkout.session.completed` → **Upsert** in `purchases` (`onConflict: user_id,course_id`) über den Service-Role-Admin-Client. In Vercel muss `STRIPE_WEBHOOK_SECRET` das **Snapshot**-Secret sein.
- **Status:** Webhook ist **live und nachweislich funktionierend** (zuletzt geprüft 30.06.2026 – Test-Kauf wurde automatisch freigeschaltet).

## Deploy & Hosting

- GitHub: `https://github.com/lkinkel01/gradefruit`, Branch **`main`**.
- **Vercel** deployt automatisch bei Push auf `main`. Live: **www.gradefruit.de** (Alias `gradefruit-iota.vercel.app`).
- Domain läuft über **Hostinger**.
- Vercel-CLI ist **nicht** installiert/verlinkt → Env-Variablen ändern + Redeploy macht Leon im Vercel-Dashboard.

## Env-Variablen (nur Namen, nie Werte!)

`.env.local` enthält:
`ANTHROPIC_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_MODEL, ELEVENLABS_VOICE_ID, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ONE_TIME, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY`
→ Hinweis: **LK-Preise (`STRIPE_PRICE_LK_ONE_TIME`, `STRIPE_PRICE_LK_MONTHLY`) fehlen lokal noch.**

---

## Stand & Roadmap

**Fertig:** DB+RLS, Auth, KI-Hilfe (`/api/ask` mit Tageslimit), Checkout+Webhook+Portal, Account-Verwaltung, Erklärvideo-Player mit ElevenLabs-Stimme, Live-Deploy auf eigener Domain, Landing Page + Dashboard optisch poliert, mobil optimiert.

**Noch offen / Ideen (Backlog):**
- Kostenlose Vorschau ohne Login (GK + LK antesten)
- Mehr Inhalt: Themen-Zusammenfassungen, Kategorie „Altklausuraufgaben", Studyflix-artige Videos
- KI-/Tutor-Hilfe pro Lösungsschritt (granularer)
- Nur eine aktive Sitzung gleichzeitig (anderes Gerät rauswerfen)
- Zeitlich begrenzter Zugang bis Prüfungsdatum + 1–2 Tage
- Native App (Capacitor/PWA), Screenshot-Schutz
