# Gradefruit Workspace einrichten

Der Workspace benötigt zwei neue, vollständig getrennte Projekte. Das
bestehende Vercel- und Supabase-Projekt der Gradefruit-Lernplattform wird weder
verwendet noch verändert.

Gespeichert werden ausschließlich Aufgaben, Ideen, Milestones, Vision,
Workspace-Links, Reihenfolgen und Darstellungswerte. Kundendaten,
Zahlungsdaten, Lernplattform-Nutzerdaten, Zugangsdaten, Secrets und private
Dokumente gehören ausdrücklich nicht in den Workspace.

## 1. Separates Supabase-Projekt

1. Ein neues Supabase-Projekt nur für „Gradefruit Workspace“ anlegen.
2. Die SQL-Datei unter
   `supabase/migrations/20260715170000_create_workspace.sql` ausschließlich in
   diesem neuen Projekt ausführen.
3. Unter Authentication einen einzigen Benutzer für Leon mit E-Mail und einem
   starken Passwort manuell anlegen.
4. In den Auth-Einstellungen „Allow new users to sign up“ deaktivieren. Es gibt
   in der App keine Registrierung und es werden keine weiteren Benutzer
   angelegt.
5. Leons Benutzer-ID kopieren. Sie wird als `WORKSPACE_OWNER_ID` verwendet.
6. Beim ersten Login richtet Leon den TOTP-Faktor mit einer Authenticator-App
   ein. Danach sind Workspace-Zugriffe nur noch mit AAL2-Sitzung möglich.

Die Migration aktiviert Row Level Security für jede Tabelle. Separate
SELECT-, INSERT-, UPDATE- und DELETE-Policies erlauben ausschließlich Zeilen,
deren `owner_id` der angemeldeten Benutzer-ID entspricht. Zusätzlich verlangen
restriktive Policies einen bestätigten TOTP-Faktor. Die atomare Funktion zum
Umwandeln einer Idee läuft mit den Rechten des angemeldeten Benutzers.

## 2. Lokale Umgebungsvariablen

`tools/control-center/.env.example` nach
`tools/control-center/.env.local` kopieren und mit Werten des separaten
Workspace-Projekts ausfüllen:

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Publishable Key
- `WORKSPACE_OWNER_ID`: Leons Benutzer-ID aus Supabase Auth

Keinen Service-Role-Key verwenden. `.env.local` bleibt ignoriert.

## 3. Separates Vercel-Projekt

Ein neues Vercel-Projekt aus demselben Repository anlegen:

- Root Directory: `tools/control-center`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Framework Preset: Next.js
- Umgebungsvariablen: die drei oben genannten Werte

Eine eigene Vercel-Domain oder eine getrennte Workspace-Subdomain verwenden.
Das bestehende Gradefruit-Vercel-Projekt nicht verändern.

In Supabase Auth für das separate Workspace-Projekt eintragen:

- Site URL: die endgültige Workspace-URL
- Redirect URL lokal: `http://127.0.0.1:3010/**`
- Redirect URL Vercel: `https://DEINE-WORKSPACE-DOMAIN/**`

Vercel Deployment Protection kann, soweit der verwendete Plan die
Produktionsdomain schützt, zusätzlich aktiviert werden. Supabase Login, TOTP
und RLS bleiben unabhängig davon zwingend.

## 4. Bestehende lokale Daten übernehmen

1. Anmelden und „Bestehende lokale Daten importieren“ öffnen.
2. `.control-center/workspace.json` auswählen.
3. Vorschau und erkannte Duplikate prüfen.
4. Import ausdrücklich bestätigen.

Importiert werden nur Aufgaben, Ideen, Milestones, Vision und Links. Die
`owner_id` kommt immer aus der serverseitig geprüften Sitzung. Agentenarchive,
Logs und frühere Automatisierungsdaten werden ignoriert. Lokale Dateien werden
nicht gelöscht.

## 5. Prüfung vor dem ersten Deployment

- Registrierung ist in Supabase deaktiviert.
- Es existiert nur Leons Benutzer.
- TOTP ist eingerichtet und der Login erreicht AAL2.
- Die Migration liegt im getrennten Workspace-Projekt.
- Fremde Testnutzer können wegen RLS keine Zeilen lesen oder verändern.
- Vercel verwendet nur die Workspace-Umgebungsvariablen.
- Keine echten Secrets oder lokalen Daten sind in Git enthalten.
