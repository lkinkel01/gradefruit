# App Store — alles Fertige zum Einreichen

Diese Datei enthält jeden Text, den App Store Connect abfragt. Beim Einreichen
kopieren, nichts neu erfinden.

> **Reihenfolge:** Erst die drei nativen Funktionen fertig, dann das
> Entwicklerprogramm (99 $/Jahr). Vorher ist es Geld für eine wahrscheinliche
> Ablehnung. Stand: Offline-Download ✅ · Lernerinnerung 🟡 · Widget ❌

## Grunddaten

| Feld | Wert |
|---|---|
| App-Name (max. 30 Zeichen) | `Gradefruit Abiturvorbereitung` (29) |
| Untertitel (max. 30) | `Mathe Abitur Hessen 2027` (24) |
| Bundle-ID | `de.gradefruit.app` |
| Primäre Kategorie | Bildung |
| Sekundäre Kategorie | Bildung › Nachschlagewerke |
| Altersfreigabe | 4+ (keine bedenklichen Inhalte) |
| Support-URL | `https://www.gradefruit.de/impressum` |
| Datenschutz-URL | `https://www.gradefruit.de/datenschutz` |
| Copyright | `Leon Kinkel` |

## Werbetext (max. 170 Zeichen, jederzeit änderbar)

```
Aufgaben mit Schritt-für-Schritt-Lösungen, Zusammenfassungen und ein KI-Coach —
abgestimmt auf das schriftliche Mathe-Abi in Hessen 2027.
```

## Beschreibung

```
Gradefruit bereitet dich auf das schriftliche Mathematik-Abitur in Hessen 2027
vor — im Grundkurs wie im Leistungskurs.

WAS DRIN IST
• Prüfungsnahe Aufgaben zu Analysis, Linearer Algebra und Stochastik
• Zu jeder Aufgabe ein vollständiger Lösungsweg, Schritt für Schritt
• Zusammenfassungen mit allen Formeln, die du sicher können musst
• Typische Fehler zu jeder Aufgabe — damit du sie nicht selbst machst
• Ein KI-Coach, der auf Nachfrage erklärt, rund um die Uhr

WIE DU LERNST
Ordne jede Aufgabe als verstanden, zu wiederholen oder unklar ein. Die
Wiederholen-Seite sammelt, was noch offen ist, und stellt das Wichtigste nach
oben. Ein Countdown zeigt dir, wie viel Zeit bis zur Prüfung bleibt.

OFFLINE LERNEN
Lade ganze Themen aufs Gerät und lies sie ohne Internet — im Zug, in der Bahn,
in der Freistunde. Die Inhalte liegen verschlüsselt auf deinem Gerät und
verschwinden beim Abmelden.

ERINNERUNGEN
Stell eine Uhrzeit ein und die App meldet sich täglich. Kurz, einmal am Tag.

ZUM KURS
Analysis kannst du kostenlos ausprobieren, ohne Konto. Der vollständige Kurs
ist kostenpflichtig.

Alle Aufgaben sind eigens für Gradefruit geschrieben und am hessischen Lehrplan
orientiert — keine kopierten Prüfungsaufgaben.
```

## Schlüsselwörter (max. 100 Zeichen, Komma-getrennt, keine Leerzeichen)

```
mathe,nachhilfe,abitur,hessen,abi2027,analysis,stochastik,algebra,lernen,formeln
```

## Hinweise für die Prüfung (App Review Notes)

**Wichtigstes Feld überhaupt.** Apple lehnt Apps ab, die nur eine Website
zeigen (Richtlinie 4.2). Diese Notiz beugt genau dem vor:

```
Testzugang:
E-Mail: (vor dem Einreichen ein Konto anlegen und hier eintragen)
Passwort: (…)

Die App ist keine reine Web-Ansicht. Native Funktionen:

1. Offline-Nutzung: Ganze Themen lassen sich auf das Gerät laden und ohne
   Internetverbindung lesen. Die Inhalte liegen verschlüsselt lokal und werden
   beim Abmelden gelöscht. Zum Prüfen: Thema öffnen, "Für offline speichern"
   antippen, Flugmodus einschalten, Aufgaben weiter lesen.

2. Lokale Mitteilungen: Unter "Mein Konto" lässt sich eine tägliche
   Lernerinnerung mit eigener Uhrzeit einstellen. Sie wird auf dem Gerät
   geplant und erscheint auch bei geschlossener App.

3. KI-Coach: Der Coach beantwortet ausschließlich Fragen zu Mathematik und
   zum Lernen. Anstößige, sexuelle, gewaltverherrlichende Ausgaben sind im
   Systemtext ausgeschlossen, ebenso medizinische, rechtliche und finanzielle
   Ratschläge. Unter jeder Antwort steht „Antwort melden", das eine Mail an den
   Betreiber öffnet. Bei Anzeichen einer seelischen Notlage verweist der Coach
   auf die Telefonseelsorge.

4. (Widget mit Prüfungs-Countdown — beim Einreichen ergänzen, sobald gebaut)

Käufe: (Vor dem Einreichen klären — siehe Abschnitt unten.)
```

## Bildschirmfotos

Pflicht sind zwei Größen; alle anderen leitet Apple daraus ab.

| Gerät | Auflösung | Anzahl |
|---|---|---|
| iPhone 6,9" (15/16 Pro Max) | 1290 × 2796 | 3–10 |
| iPhone 6,5" (11 Pro Max, XS Max) | 1242 × 2688 | 3–10 |

Vorschlag für die Reihenfolge — die erste zählt am meisten:

1. Aufgabe mit aufgeklapptem Lösungsweg
2. Themenseite mit "Offline verfügbar"
3. Wiederholen-Seite mit eingeordneten Aufgaben
4. Dashboard mit Countdown
5. KI-Coach mit einer echten Frage

## Vor dem Einreichen zwingend klären

**Apples Provision.** Digitale Inhalte, die in der App freigeschaltet werden,
verlangen In-App-Kauf mit 15–30 %. Der Stripe-Kauf auf der Website ist dafür
nicht zulässig. Zwei gangbare Wege:

- **In-App-Kauf einbauen** — teuer in der Marge, aber unstrittig.
- **Die App nur für bereits Gekaufte** — kein Kaufweg in der App, kein Hinweis
  darauf. Apple erlaubt das, aber die App darf dann *nirgends* zum Kauf
  auffordern. Das betrifft auch die Website-Ansicht in der App.

Diese Entscheidung gehört vor die Anmeldung zum Entwicklerprogramm, nicht
danach — sie ändert, was gebaut werden muss.
