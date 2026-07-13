# Gradefruit — Creative Direction (Board)

**Status: 🟠 Entwurf — noch nicht freigegeben.**

Dies ist das visuelle Creative-Direction-Board für Gradefruit. Es hält eine
zu prüfende Gestaltungsrichtung fest, damit jede spätere
Entscheidung konsistent wird — **bevor** irgendein Screen umgebaut wird.

## Zweck

Das Board macht die Richtung **sichtbar und prüfbar**, statt sie nur zu
beschreiben. Es zeigt:

- den emotionalen Reframe (vom Countdown zur Kontrolle),
- was übernommen und was verworfen wird — mit Begründung,
- die Farb-, Typo-, Kompositions-, Navigations-, Bild-, Motion- und
  Copy-Richtung (Light **und** Dark),
- jede Referenzmarke (Apple, Nike, Peso/LFDY, Spotify, Arc, Linear, Lacoste)
  übersetzt in eine konkrete Gradefruit-Regel,
- den Umsetzungsplan mit Reihenfolge.

Es ist bewusst **light-first** gebaut und verkörpert die neue Sprache selbst.

## Lokal öffnen

Die Datei ist vollständig eigenständig (System-Schriften, Inline-CSS/JS,
CSS-gezeichnete Grapefruit). **Kein Login, kein Internet, kein privates
Claude-Artefakt nötig.**

- **Einfachster Weg:** `docs/creative-direction/index.html` per Doppelklick im
  Finder öffnen — sie läuft direkt im Browser.
- **Hell/Dunkel:** oben rechts der Button „Hell / Dunkel". Ohne Klick folgt
  die Seite dem System-Theme deines Rechners.

> Falls dein Browser eine lokale Datei zu streng behandelt, kannst du den
> Ordner auch über einen kleinen lokalen Server ansehen:
> `python3 -m http.server 8123 --directory docs/creative-direction`
> und dann `http://localhost:8123/` öffnen.

## Wichtig

- **DESIGN.md und PRODUCT.md werden erst nach ausdrücklicher Freigabe von Leon
  geändert.** Bis dahin bleibt die aktuelle „Editorial-Regel" in DESIGN.md das
  gültige (noch nicht abgelöste) Gesetz.
- Der Entwurf selbst verändert **keinen Produktcode, keine globalen Tokens,
  keine Landingpage und keine App-Oberfläche**.
- Die Farben und Schriftgrößen im Board weichen **absichtlich** von der
  aktuellen DESIGN.md ab — das Board schlägt die neue Sprache vor. (Der
  Impeccable-Hook meldet das als „Abweichung"; das ist hier gewollt.)

## Nächster Schritt

Leon prüft das Board. Nach seiner Freigabe (oder gewünschten Änderungen) wird
die Richtung in DESIGN.md + PRODUCT.md kanonisch festgeschrieben und ersetzt
die „Editorial-Regel". Erst danach beginnt Sprint 1 (Fundament).
