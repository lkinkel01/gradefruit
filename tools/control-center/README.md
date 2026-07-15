# Gradefruit Workspace

Gradefruit Workspace ist Leons privater, manuell gepflegter Arbeitsbereich für
Aufgaben, Ideen, Milestones, Vision und wichtige Links. Die Web-App verwendet
ein eigenes Supabase-Projekt und ein eigenes Vercel-Projekt. Sie greift nicht
auf Daten oder Infrastruktur der Gradefruit-Lernplattform zu.

## Lokal auf dem Mac starten

1. `tools/control-center/.env.local` anhand von `.env.example` ausfüllen.
2. Im Root des Gradefruit-Repositories `npm run control-center` ausführen.
3. `http://127.0.0.1:3010/login` öffnen.

## Auf Mac und Handy verwenden

Nach dem separaten Vercel-Deployment wird dieselbe geschützte Web-Adresse auf
Mac und Handy geöffnet. Der Mac muss dafür nicht eingeschaltet sein. Über das
Browser-Menü kann der Workspace optional zum Home-Bildschirm hinzugefügt
werden; ein komplexer Offline-Modus ist nicht enthalten.

## Daten und Sicherung

Die aktiven Workspace-Daten liegen im separaten Supabase-Postgres-Projekt. Die
bisherigen lokalen Dateien unter `.control-center/` bleiben ignoriert und als
Backup erhalten. Die einmalige Übernahme der bestehenden lokalen Daten ist
abgeschlossen; der Workspace wird jetzt direkt über die gemeinsamen
Supabase-Daten gepflegt.

Es findet keine automatische Synchronisation mit Claude, Codex oder ChatGPT
statt. Zugangsdaten gehören nur in lokale beziehungsweise Vercel-
Umgebungsvariablen und niemals ins Repository.

Der Workspace kann weder andere Dateien auf dem Mac lesen noch auf Kamera,
Mikrofon, Standort oder andere Gerätefunktionen zugreifen. Im Browser sind nur
Verbindungen zur Workspace-Webseite und zum eigenen Supabase-Projekt erlaubt.
Die sichtbare Supabase-URL und der Publishable Key sind für Browser-Apps
bestimmt; der Zugriff auf Inhalte wird zusätzlich durch Anmeldung, TOTP und
Row Level Security geschützt. Ein Service-Role-Key wird nicht verwendet.

Die vollständige Einrichtung steht in [docs/SETUP.md](docs/SETUP.md).
