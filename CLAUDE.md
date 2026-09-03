@AGENTS.md

# Gradefruit

Lernplattform für das **schriftliche Mathe-Abitur Hessen 2027**. Schüler:innen
kaufen Zugang (GK oder LK) und üben mit Aufgaben, Lösungen, KI-Coach,
Erklärvideos und einem Wiederholungssystem.

> Hinweis: `@AGENTS.md` oben warnt, dass diese **Next.js-Version von der
> Standard-Version abweicht** — vor Code-Änderungen die Doku in
> `node_modules/next/dist/docs/` beachten.

## Dokumenten-Landkarte (Lesereihenfolge für neue Sessions)

| Datei | Rolle |
|---|---|
| **CLAUDE.md** (diese Datei) | Dauerhafte Entwicklungsregeln — lädt automatisch |
| **[PRODUCT.md](PRODUCT.md)** | Produkt: Mission, Zielgruppe, Marke, Prinzipien, Anti-Referenzen, Strategie, Content-Pipeline. **Vor Produkt-/UX-Entscheidungen lesen.** |
| **[DESIGN.md](DESIGN.md)** | Designsystem: Tokens, Typo, Komponenten, Motion, Do/Don'ts. **Vor UI-Arbeit lesen** (Impeccable lädt beide automatisch). |
| **[PROJECT_STATUS.md](PROJECT_STATUS.md)** | Aktueller Stand + vollständige Sprint-Historie. Einzige Quelle für „was ist fertig / offen". Nach großen Änderungen aktualisieren. |
| **[HANDOUT.md](HANDOUT.md)** | Session-Start für Leon (kopierbare Prompts, nächste Schritte). |
| **Notion-Workspace „Gradefruit — Unternehmen"** | Alles Unternehmerische: Gründung & Recht, Finanzen, Controlling/KPIs, Marketing, Vertrieb, Support, Betrieb, Prompts. Liegt in Leons Notion, nicht im Repo. |

Fakten stehen genau EINMAL: Produkt-Aussagen in PRODUCT.md, Design-Regeln in
DESIGN.md, Zustand in PROJECT_STATUS.md, Unternehmerisches im Notion-Workspace.
Diese Datei verweist nur.

## Wie ich mit Leon arbeite (wichtig)

- Leon ist **nicht-technisch**. Erklär einfach, auf **Deutsch**, per **„du"**,
  in kleinen Schritten. Kein Fachjargon ohne kurze Erklärung.
- **Leon kann KEINE Dateien öffnen oder bearbeiten.** Ich (Claude) ändere alle
  Dateien selbst. Sag ihm nie „öffne Datei X und ändere Zeile Y".
- Leon **kann** Web-Dashboards bedienen: Stripe, Supabase, ElevenLabs, Vercel,
  GitHub, Hostinger. Dafür darf ich ihm Klick-Anleitungen geben.
- Muss Leon einen Datei-Inhalt sehen? → **committen + pushen**, dann auf
  GitHubs „Copy raw file" verweisen.
- **Lokale Commits nach vollständig bestandener Prüfung selbstständig und nur
  mit selektivem Staging erstellen. Pushen nur, wenn Leon ausdrücklich darum
  bittet** (Push auf `main` = Live-Deploy auf Vercel).
- Codex und Claude Code arbeiten abwechselnd dieselbe priorisierte Notion-Liste
  ab. `HANDOUT.md` hält den lokalen Übergabestand fest, damit der nächste Agent
  vorhandene Arbeit fortsetzt statt neu zu beginnen.

## Sicherheitsregeln (NICHT verhandelbar)

- Geheime Schlüssel **immer in `.env.local`**, **niemals** in sichtbaren Code
  und **niemals** mit `NEXT_PUBLIC_`-Präfix (sonst landen sie im Browser).
- `ANTHROPIC_API_KEY` und `ELEVENLABS_API_KEY` sind **server-only**.
- **Kartendaten fasst niemand selbst an — das macht alles Stripe.**
- Secrets in Vercels **verschlüsseltem Env-Speicher** einzutragen ist der
  **richtige, sichere** Ort — das ist NICHT „sichtbarer Code".
- **Beim Prüfen per lokalem Skript:** Secrets über
  `node --env-file=.env.local …` laden, damit die **Werte nie** in den Chat
  geraten. Beim Inspizieren von `.env.local` nur die **Namen** lesen
  (z. B. per `grep`), nie die Werte.
- Zugang schaltet **ausschließlich** der signatur-geprüfte, idempotente
  Stripe-Webhook frei — nie clientseitig.

## Stack

- **Next.js 16.2.9** (App Router, Turbopack) + **TypeScript** — abweichende
  Version, siehe `@AGENTS.md`
- **CSS Modules** — **kein Tailwind**
- **Supabase**: Auth (E-Mail+Passwort und Google-OAuth) + Postgres mit **RLS**
- **Stripe** im **TEST-/Sandbox-Modus** (Umstellung auf Live = Verkaufsstart)
- **ElevenLabs** (TTS für Erklärvideos), **Anthropic API** (KI-Coach)

## Umgebung & Befehle (macOS, zsh)

- node/npm liegen unter `/opt/homebrew/bin` → in Skripten zuerst
  `eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null;`
- **Bash merkt sich das Verzeichnis NICHT zwischen Aufrufen.** Standard ist
  `/Users/leonkinkel/Documents` → in **jedem** Befehl
  `cd /Users/leonkinkel/Gradefruit`.
- **Typecheck:** `./node_modules/.bin/tsc --noEmit`
- **Build:**
  ```
  eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null; unset ANTHROPIC_API_KEY && cd /Users/leonkinkel/Gradefruit && npm run build
  ```
  (`unset ANTHROPIC_API_KEY` ist nötig, sonst bricht der Build ab.)
- **Dev-Server:** über die Browser-Preview (`.claude/launch.json`, Config
  „dev", Port 3000) — nicht per Bash starten.
- **Webhook-Check:** `node --env-file=.env.local scripts/check-webhook.mjs`
  → gibt am Ende `VERDICT:` aus.

## Verifikation (vor jedem Commit Pflicht)

1. `tsc --noEmit` sauber.
2. Build sauber (Befehl oben).
3. **Im Preview-Browser testen:** betroffene Flows durchklicken — hell UND
   dunkel, Desktop UND mobil (375px). Screenshots als Beleg.
4. Braucht der Test einen Login: Wegwerf-Konto per
   `node --env-file=.env.local scripts/create-test-user.mjs <zweck>`
   anlegen, nach dem Test mit `scripts/delete-test-user.mjs <zweck>` löschen.
   (E-Mail-Muster `gradefruit.<zweck>.test@gmail.com`, Bestätigung ist aus.)
5. Gezielt stagen: `git add <dateien>` — nie pauschal `git add -A`.
6. Commit/Push nur auf Leons Ansage; danach PROJECT_STATUS.md aktualisieren.

## Projektstruktur

- `src/app/` — Seiten (App Router); API-Routen unter `src/app/api/…`
  (`ask`, `content`, `checkout`, `stripe/webhook`, `stripe/portal`,
  `account/delete`); `/feed` = Reel-Modus
- `src/components/` — UI-Komponenten, je mit `*.module.css`
- `src/server/content/` — **die Kursinhalte** (`*Tasks.ts`, 6 Dateien, und
  `summaries.ts`); nur über `src/app/api/content/` erreichbar
- `src/lib/` — Logik & Verzeichnis: `contentIndex.ts` (erzeugt, nur
  Überschriften), `ContentContext.tsx` (lädt Inhalte nach), `scenes.ts`
  (Videos),
  `ProgressContext.tsx` (Kauf-Status + Lernstufen), `exam.ts`
  (**einzige Quelle für den Prüfungstermin**), `types.ts` (Views, Topics,
  LernStatus); Server-Helfer `stripe.ts`, `supabaseAdmin.ts`
- `supabase/` — SQL-Referenz: `schema.sql`, `stripe.sql`, `ai-rate-limit.sql`,
  `lessons-seed.sql`, `lk-course-seed.sql`, `summary-sections-seed.sql`
  (ausgeführt im Supabase-Dashboard)
- `scripts/` — `generate-audio.mjs`, `check-webhook.mjs`,
  `build-content-index.mjs`, `check-content-gate.mjs`,
  `create-test-user.mjs`, `delete-test-user.mjs`
- `public/audio/` — mp3s der Erklärvideos
- `.claude/` — Settings (Impeccable-Hook), `launch.json`, Skills;
  `.agents/skills/` — Emil-Kowalski-Skills; `skills/` + `templates/` —
  TasteSkill; `.impeccable/` — Impeccable-Cache (ignoriert) +
  `design.json` (Design-Token-Sidecar, versioniert)

## Architektur-Grundentscheidungen (die tragenden Fakten)

Wer eine dieser Entscheidungen nicht kennt, baut mit hoher Wahrscheinlichkeit
etwas falsch. Alle bewusst so getroffen — nicht „aufräumen":

1. **Inhalte liegen server-seitig** (`src/server/content/`, mit `server-only`
   abgeriegelt) und werden **einzeln über `GET /api/content?topic=…&level=…`
   ausgeliefert — erst nach Zugangsprüfung** (angemeldet + Kauf, Analysis
   gratis). Der Browser bekommt nur `src/lib/contentIndex.ts`: IDs und
   Überschriften für die Navigation. **Die Bezahlschranke ist damit eine
   echte Grenze**, nicht nur Oberfläche. Wer eine Inhaltsdatei aus einer
   Client-Komponente importiert, bricht den Build — das ist Absicht.
   Nach jeder Inhaltsänderung: `node scripts/build-content-index.mjs`.
   Prüfen: `node --env-file=.env.local scripts/check-content-gate.mjs
   <email> <passwort>` gibt `VERDICT:` aus (Dev-Server muss laufen).
2. **Zugang schaltet ausschließlich der Stripe-Webhook frei**, nie
   clientseitig (siehe Sicherheitsregeln + Bezahlung). Der Client liest den
   Status nur, er setzt ihn nie.
3. **Navigation ist eine View-State-Machine in `src/app/page.tsx`**
   (`view`-State + `renderContent()`), KEIN Next.js-Routing. Deshalb gibt es
   keinen `/dashboard`-Pfad — alles hinter dem Login ist dieselbe Route `/`.
   **Einzige echte Route: `/feed`** (Reel-Modus, weil Vollbild-Gesten-Fläche).
   Neue „Seiten" sind neue `View`-Werte in `types.ts` + ein `case` in
   `page.tsx`, kein neuer Ordner unter `src/app/`.
4. **Drei-Stufen-Lernstatus auf zwei Bool-Spalten kodiert** (Details unten
   im DB-Abschnitt) — die Kombinationen sind bewusst gewählt, nicht die
   naheliegende „eine Spalte pro Status".
5. **Alle Aufgaben sind Original** (Urheberrecht + Skalierbarkeit) — Werbe-
   und UI-Texte sagen „prüfungsnah", niemals „echte Abituraufgaben".

## Design & UI-Regeln (Kurzfassung — Details in DESIGN.md)

- **Vor jeder UI-Arbeit DESIGN.md lesen.** Farben nur über CSS-Variablen aus
  `globals.css`; Dark Mode = `body.dark` überschreibt Variablen.
- **Niemals globale Selektoren auf CSS-Modul-Klassen** richten (Hashes!) —
  Theme-Werte als Variable durchreichen (Lehre aus dem Topbar-Bug).
- Globale Klassen (z. B. `.btn`) aus Modulen via `:global(.btn)`.
- Mobiles Menü: Sidebar wird ≤900px zur Schublade über `body.navopen`.
- Overlays (Modals/Player) per React-Portal an `document.body` —
  animierte Eltern fangen `position: fixed` sonst ein.
- **Keine Emojis im UI.** Fortschritt nur als `GrapefruitProgress`.
- Nur `transform`/`opacity`/Farben animieren; nie `transition: all`.

## Installierte Skills & Hooks

- **Impeccable** (`.claude/skills/impeccable/`, aufrufbar als `/impeccable`):
  Design-Arbeit jeder Art (craft/polish/audit/critique/…). Lädt PRODUCT.md +
  DESIGN.md automatisch. Ein **PostToolUse-Hook** (`.claude/settings.local.json`)
  scannt jede UI-Datei-Änderung und meldet Design-Verstöße als Reminder —
  Funde ernst nehmen: echte Probleme fixen, bewusste Ausnahmen begründen.
- **Emil-Kowalski-Skills** (`.agents/skills/`): `emil-design-eng`
  (UI-Polish-Philosophie), `apple-design` (fluide, physische Interaktionen),
  `animation-vocabulary` (Namen für Motion-Effekte), `review-animations`
  (strenger Motion-Review; nur explizit aufrufen). Bei Motion-/
  Interaktions-Arbeit den passenden Skill laden.
- **TasteSkill** (`skills/taste/` + Prompt-Vorlagen in `templates/taste/`,
  angebunden über `.claude/skills/taste/`): Anti-Slop-Grundregeln in 7
  Varianten (default, soft-calm, editorial, redesign, …). Bei Konflikten
  gilt: **DESIGN.md > Impeccable > TasteSkill.**
- Skill-Versionen: `skills-lock.json` (Quelle: github.com/emilkowalski/skills).

## localStorage-Register (alle Schlüssel mit `gf-`-Präfix)

| Schlüssel | Zweck | Lebensdauer |
|---|---|---|
| `gf-theme` | `light`/`dark` (liest das Inline-Skript in `layout.tsx`) | dauerhaft |
| `gf-level` | Kursstufen-Wahl von Gästen/Doppelkäufern (`gk`/`lk`) | dauerhaft |
| `gf-open-topic` | Deep-Link: Thema beim nächsten `/`-Besuch öffnen | einmalig, wird konsumiert |
| `gf-open-tab` | Deep-Link: Tab (`zusammenfassung`/`uebungen`) | einmalig, wird konsumiert |
| `gf-open-task` | Deep-Link: Aufgabe aufklappen + hinscrollen | einmalig, wird konsumiert |
| `gf-open-summary` | Deep-Link: Abschnitt einer Zusammenfassung aufklappen + hinscrollen | einmalig, wird konsumiert |
| `gf-summary-status` | **Altbestand.** Der Lernstatus der Zusammenfassungsabschnitte liegt seit 02.09.2026 auf dem Server (Abschnitte sind Lektionen mit Slug `sec:<thema>:<stufe>:<Überschrift>`, siehe `supabase/summary-sections-seed.sql`). `TopicView.tsx` schiebt vorhandene lokale Werte einmalig hoch. | wird nach erfolgreicher Übernahme gelöscht |
| `gf-feed-topic` | Reel-Modus: Themen-Fokus für `/feed` | bleibt bis überschrieben |
| `gf-review-status` | Wiederholen-Seite: vorgewählter Stufen-Filter | einmalig, wird konsumiert |

Einmal-Schlüssel werden StrictMode-sicher über Refs konsumiert (Muster in
`TopicView.tsx`); neue Schlüssel hier eintragen.

## Datenbank (Supabase, RLS aktiv)

- **`purchases`**: `id, user_id, course_id, status, purchased_at, plan,
  stripe_customer_id, stripe_subscription_id, stripe_checkout_session_id,
  current_period_end, updated_at` → **Zeitstempel heißt `purchased_at`,
  NICHT `created_at`.**
- **`lessons`** (171 Einträge, Stand 02.09.2026: 133 Aufgaben mit den
  Aufgaben-IDs als Slug + 38 Zusammenfassungs-Abschnitte mit dem Slug
  `sec:<thema>:<stufe>:<Überschrift>`) + **`progress`** (`understood`, `saved`
  als Bools). Die drei **Lernstufen** sind darauf kodiert: verstanden=(1,0),
  wiederholen=(0,1), unklar=(1,1), keine=(0,0) — Logik ausschließlich in
  `ProgressContext.tsx` (`statusOf`/`setStatus`).
  **Nach neuen Aufgaben** `node --env-file=.env.local scripts/seed-lessons.mjs`
  laufen lassen; sonst lässt sich ihr Lernstatus nicht speichern (genau so
  gingen 54 Aufgaben lange unter).

## Bezahlung (Stripe, Testmodus)

- **Zwei Kurse:** GK (`mathe-gk`) und LK (`mathe-lk`), je eigene Bezahlschranke;
  nur Analysis ist gratis.
- **Checkout:** `src/app/api/checkout/route.ts` (Node-Runtime, Bearer-Auth).
  Setzt `client_reference_id = user.id`, `metadata = { user_id, course_id,
  plan }`, `success_url = …/?checkout=success`.
- **Webhook:** `src/app/api/stripe/webhook/route.ts` (Node-Runtime).
  **Snapshot-Events** (klassisch v1) + `stripe.webhooks.constructEvent` +
  `event.data.object`. Bei `checkout.session.completed` → **Upsert** in
  `purchases` (`onConflict: user_id,course_id`) über den Service-Role-Client.
  In Vercel muss `STRIPE_WEBHOOK_SECRET` das **Snapshot**-Secret sein.
- Webhook ist live und nachweislich funktionierend (Test-Kauf 30.06.2026).

## Deploy & Hosting

- GitHub: `https://github.com/lkinkel01/gradefruit`, Branch **`main`**.
- **Vercel** deployt automatisch bei Push auf `main`.
  Live: **www.gradefruit.de** (Alias `gradefruit-iota.vercel.app`).
- Domain über **Hostinger**. Vercel-CLI ist **nicht** installiert →
  Env-Variablen + Redeploy macht Leon im Vercel-Dashboard.

## Env-Variablen (nur Namen, nie Werte!)

`.env.local` enthält:
`ANTHROPIC_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_MODEL,
ELEVENLABS_VOICE_ID, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
NEXT_PUBLIC_SUPABASE_URL, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ONE_TIME,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY`
→ **LK-Preise (`STRIPE_PRICE_LK_ONE_TIME`, `STRIPE_PRICE_LK_MONTHLY`) fehlen
lokal noch** (in Vercel für den Live-Gang nötig).

## Cloud-Sitzungen (Leon arbeitet vom Handy)

Leon startet Aufgaben unterwegs über claude.ai/code bzw. die Claude-App. Diese
Sitzungen laufen auf Anthropics Servern, **nicht auf seinem Mac** — sein Laptop
darf zu sein. Wer dort arbeitet, hat einen frischen Container mit dem Repo aus
GitHub und sonst nichts.

**Was dort NICHT vorhanden ist — nicht versuchen, sondern sagen und vertagen:**

- **Keine `.env.local`.** Alle Skripte mit `node --env-file=.env.local …`
  (`create-test-user`, `delete-test-user`, `check-webhook`,
  `check-content-gate`) laufen nicht. Damit gibt es auch **keine Testkonten**.
- **Kein Xcode, kein iOS-Simulator, kein iPhone.** Alles Native (App bauen,
  `AppDelegate.swift` prüfen, Screenshot-Schutz, Mitteilungen, Flugmodus)
  gehört in eine Sitzung am Mac. Änderungen an `native/` kann man schreiben,
  aber nicht prüfen — dann klar dazusagen, dass es ungeprüft ist.
- **Keine Browser-Vorschau.** Der Dev-Server lässt sich starten, aber niemand
  kann hineinsehen. Layout-Aussagen also nicht behaupten, sondern aus dem Code
  begründen — oder auf die nächste Mac-Sitzung verschieben.

**Was dort geht:** alles am Web-Teil — Inhalte, Texte, Layout-Code, Logik,
Fehlerbehebung, `tsc --noEmit`, `npm run build`, committen und pushen (Vercel
deployt automatisch).

**Umgebungsvariablen der Cloud-Umgebung:** `npm run build` bricht ohne
`NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` ab (Supabase-
Client beim Vorrendern). Beide sind öffentlich — sie stehen ohnehin im
Browser-Bündel. **Alles andere gehört dort nicht hinein**, besonders nicht
`SUPABASE_SERVICE_ROLE_KEY` und die Stripe-Schlüssel: Ein Build braucht sie
nicht, und was nicht da ist, kann nicht verloren gehen.

## Stand & offene Aufgaben

Steht ausschließlich in **[PROJECT_STATUS.md](PROJECT_STATUS.md)** (kompakter
Ist-Zustand oben, vollständige Sprint-Historie darunter). Diese Datei hier
enthält bewusst keinen Projektstand.
