# Gradefruit als App (iOS + Android)

Diese Hülle existiert aus genau **einem** Grund: Screenshots.

Eine Webseite kann Screenshots weder erkennen noch verhindern — in keinem
Browser, auf keinem Betriebssystem. Eine installierte App kann es. Deshalb
zeigt diese App dieselbe Seite (`www.gradefruit.de`), aber mit den Rechten
einer echten App.

## Was der Schutz konkret tut

| Plattform | Verhalten | Datei |
|---|---|---|
| **Android** | Screenshot wird vom System abgewiesen; Aufnahmen bleiben schwarz; kein Vorschaubild in der App-Übersicht | `android/app/src/main/java/de/gradefruit/app/MainActivity.java` |
| **iOS** | Screenshots kommen leer heraus; bei laufender Bildschirmaufnahme legt sich eine Abdeckung über die App | `ios/App/App/ScreenshotGuard.swift` |

Android ist der solide Teil: `FLAG_SECURE` ist eine offizielle
Betriebssystem-Funktion, genau das, was WhatsApp im Chat setzt.

iOS hat keine Entsprechung dazu. Der Weg dort nutzt eine Eigenheit sicherer
Passwortfelder: Deren Ebene lässt iOS beim Abfotografieren des Bildschirms
grundsätzlich aus. Hängt man den App-Inhalt in diese Ebene, sieht man ihn
normal, auf dem Screenshot aber nicht. Das ist ein anerkannter, weit
verbreiteter Kniff — aber kein zugesicherter Weg: Apple kann das Verhalten
mit einer iOS-Version ändern, ohne es anzukündigen.

## Was das nicht kann

- **Abfotografieren mit einem zweiten Handy** verhindert niemand. Nie.
- **Der Kurs bleibt im Web erreichbar.** Wer die Website im Browser öffnet,
  kann dort weiterhin Screenshots machen. Die App schützt nur sich selbst.

## Bauen

Voraussetzungen, die auf Leons Mac **noch fehlen**:

| Gebraucht für | Was fehlt | Wie installieren |
|---|---|---|
| iOS | iOS-Plattform in Xcode | `xcodebuild -downloadPlatform iOS` (8,5 GB) |
| Android | Java + Android Studio | `brew install --cask temurin android-studio` |

Danach:

```
cd native
npx cap sync
npx cap open ios       # baut und startet in Xcode
npx cap open android   # baut und startet in Android Studio
```

`npx cap sync` muss nach jeder Änderung an `capacitor.config.json` laufen.
Änderungen an der Website selbst brauchen **kein** neues App-Build — die App
lädt `www.gradefruit.de` live.

## Vor einer Veröffentlichung zu klären

1. **Apple verlangt In-App-Kauf mit 15–30 % Provision** für digitale Inhalte.
   Stripe im Web ist für iOS dann nicht mehr zulässig. Das ist der größte
   Haken und trifft direkt die Marge.
2. **Konten:** Apple-Entwicklerprogramm 99 $/Jahr, Google Play 25 $ einmalig.
3. **Prüfung:** Apple lehnt Apps ab, die nur eine Website anzeigen. Die App
   braucht erkennbaren Eigenwert — der Screenshot-Schutz allein reicht
   erfahrungsgemäß nicht als Begründung.

Punkt 3 ist der Grund, warum diese Hülle als Anfang zu verstehen ist und
nicht als fertiges Produkt.
