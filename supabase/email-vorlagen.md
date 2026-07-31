# E-Mails: Absender und Wortlaut

Stand: 31.07.2026

## Warum das nicht nur eine Frage des Aussehens ist

Ohne eigenen Versanddienst verschickt Supabase die E-Mails über seinen
**eingebauten Mailer**. Der ist ausdrücklich nur zum Entwickeln gedacht und
**auf wenige Nachrichten pro Stunde begrenzt**. Beim Verkaufsstart hieße das:
Mehrere Leute setzen ihr Passwort zurück, und ab dem dritten kommt schlicht
nichts mehr an — ohne Fehlermeldung, ohne dass jemand es merkt.

Der eigene Absender löst also zwei Dinge auf einmal: Die Mail kommt von
Gradefruit, und sie kommt überhaupt.

---

## Schritt 1 — Versanddienst wählen und Domain bestätigen

Empfehlung: **Brevo** (ehemals Sendinblue). Server in der EU, kostenlos bis
300 Mails am Tag — das reicht für Gradefruit weit über den Start hinaus, und die
EU-Server passen zur Datenschutzerklärung. Alternative: **Resend**, einfacher
eingerichtet, aber US-Server.

1. Bei brevo.com ein Konto anlegen.
2. Dort **Senders, Domains & Dedicated IPs** → **Domains** → **Add a domain** →
   `gradefruit.de` eintragen.
3. Brevo zeigt drei bis vier **DNS-Einträge** an (Brevo-Code, DKIM, DMARC).
4. Die trägst du bei **Hostinger** ein: Domains → gradefruit.de → **DNS/Nameserver**
   → für jeden Eintrag auf **Eintrag hinzufügen**, Typ und Werte genau
   übernehmen.
5. Zurück bei Brevo auf **Verify** / **Authenticate** klicken. Kann bis zu einer
   Stunde dauern, bis die DNS-Änderungen wirken.
6. Unter **SMTP & API** → **SMTP** stehen dann Server, Port, Login und
   Passwort. Die brauchst du im nächsten Schritt.

> **Wichtig:** Ohne bestätigte Domain landen die Mails im Spam. Der Schritt ist
> nicht optional.

---

## Schritt 2 — In Supabase eintragen

1. supabase.com → dein Projekt
2. Links **Authentication** → **Emails** → Reiter **SMTP Settings**
3. **Enable Custom SMTP** einschalten
4. Ausfüllen:

| Feld | Wert |
|---|---|
| Sender email | `noreply@gradefruit.de` |
| Sender name | `Gradefruit` |
| Host | (aus Brevo, z. B. `smtp-relay.brevo.com`) |
| Port | `587` |
| Username | (aus Brevo) |
| Password | (aus Brevo) |

5. **Save**

Danach kommt jede E-Mail von `noreply@gradefruit.de` mit dem Absendernamen
Gradefruit.

---

## Schritt 3 — Wortlaut eintragen

**Authentication** → **Emails** → Reiter **Templates**. Für jede Vorlage den
Betreff oben und den HTML-Text unten ersetzen.

Die geschweiften Ausdrücke füllt Supabase selbst aus. Die müssen genau so
stehen bleiben.

**Warum der Link NICHT `{{ .ConfirmationURL }}` ist:** Der zeigt auf Supabases
Prüf-Adresse, und die löst den Nachweis schon beim bloßen Abrufen ein. Jeder
Spam-Prüfer, jede Klick-Verfolgung eines Versanddienstes und jede Vorschau
verbraucht ihn dadurch, bevor ein Mensch klickt. Am Ende steht „Link gilt nicht
mehr", obwohl der Link Sekunden alt ist. Genau das ist passiert.

Der Link zeigt deshalb direkt auf unsere eigene Seite und trägt den Nachweis nur
mit. Eingelöst wird er erst, wenn die Seite im Browser läuft. Ein reiner Abruf
holt nur HTML und lässt den Nachweis unberührt — nachgemessen: erst mit `curl`
abgerufen, danach im Browser weiterhin gültig.

### „Reset Password"

> **Zum Kopieren die Datei nehmen, nicht diesen Block:**
> [supabase/email-reset-password.html](email-reset-password.html) → auf GitHub
> „Raw" öffnen → alles markieren → kopieren.
>
> Grund: Wer aus einer dargestellten Ansicht kopiert (Chat, Markdown-Vorschau),
> holt sich Markdown-Reste mit. Beim ersten Versuch stand dadurch
> `[www.gradefruit.de](https://www.gradefruit.de)` wörtlich in der Fußzeile.
> Die rohe Datei enthält genau das, was ins Feld gehört, und sonst nichts.

Zweisprachig: Deutsch zuerst, Englisch darunter, getrennt durch eine feine
Linie. Wer Deutsch liest, hört nach dem ersten Block auf; wer nicht, findet
darunter dasselbe. Ein Sprachumschalter wäre in einer E-Mail nicht möglich.

**Ohne Gedankenstriche** (Leons Vorgabe, 31.07.2026): In den sichtbaren Texten
steht ein Punkt statt eines Gedankenstrichs. Beim Ändern beibehalten.

**Betreff:**

```
Neues Passwort für Gradefruit · Reset your Gradefruit password
```

**Inhalt:**

```html
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#050505;">
  <p style="font-size:20px;font-weight:700;letter-spacing:-0.02em;margin:0 0 28px;">Gradefruit</p>

  <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">
    Du hast ein neues Passwort angefordert. Über den Knopf unten kannst du eines setzen.
  </p>

  <p style="margin:0 0 20px;">
    <a href="{{ .SiteURL }}/passwort-neu?token_hash={{ .TokenHash }}&amp;type=recovery"
       style="display:inline-block;background:#050505;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:8px;font-size:15px;font-weight:600;">
      Neues Passwort setzen
    </a>
  </p>

  <p style="font-size:13.5px;line-height:1.6;color:#5F6067;margin:0 0 6px;">
    Der Link gilt eine Stunde und lässt sich nur einmal verwenden.
  </p>
  <p style="font-size:13.5px;line-height:1.6;color:#5F6067;margin:0 0 28px;">
    Wenn du das nicht warst, kannst du diese E-Mail ignorieren. Dein Passwort bleibt unverändert.
  </p>

  <hr style="border:none;border-top:1px solid #E6E6E9;margin:0 0 28px;">

  <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">
    You asked for a new password. Use the button below to set one.
  </p>

  <p style="margin:0 0 20px;">
    <a href="{{ .SiteURL }}/passwort-neu?token_hash={{ .TokenHash }}&amp;type=recovery"
       style="display:inline-block;background:#050505;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:8px;font-size:15px;font-weight:600;">
      Set a new password
    </a>
  </p>

  <p style="font-size:13.5px;line-height:1.6;color:#5F6067;margin:0 0 6px;">
    The link is valid for one hour and can only be used once.
  </p>
  <p style="font-size:13.5px;line-height:1.6;color:#5F6067;margin:0 0 28px;">
    If this wasn't you, you can ignore this email. Your password stays as it is.
  </p>

  <p style="font-size:12.5px;line-height:1.6;color:#6E7078;margin:0;border-top:1px solid #E6E6E9;padding-top:16px;">
    Gradefruit · Vorbereitung auf das schriftliche Mathe-Abitur in Hessen 2027<br>
    <a href="https://www.gradefruit.de" style="color:#6E7078;">www.gradefruit.de</a>
  </p>
</div>
```

### „Confirm signup"

Wird derzeit nicht verschickt (die Bestätigung ist aus), sollte aber stimmen,
falls sie später eingeschaltet wird.

**Betreff:**

```
Willkommen bei Gradefruit · Welcome to Gradefruit
```

**Inhalt:**

```html
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#050505;">
  <p style="font-size:20px;font-weight:700;letter-spacing:-0.02em;margin:0 0 28px;">Gradefruit</p>

  <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">
    Schön, dass du da bist. Ein Klick noch, dann geht es los.
  </p>

  <p style="margin:0 0 20px;">
    <a href="{{ .SiteURL }}/passwort-neu?token_hash={{ .TokenHash }}&amp;type=recovery"
       style="display:inline-block;background:#050505;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:8px;font-size:15px;font-weight:600;">
      E-Mail bestätigen
    </a>
  </p>

  <p style="font-size:13.5px;line-height:1.6;color:#5F6067;margin:0 0 28px;">
    Wenn du dich nicht bei Gradefruit angemeldet hast, kannst du diese E-Mail ignorieren.
  </p>

  <hr style="border:none;border-top:1px solid #E6E6E9;margin:0 0 28px;">

  <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">
    Good to have you here. One click and you're in.
  </p>

  <p style="margin:0 0 20px;">
    <a href="{{ .SiteURL }}/passwort-neu?token_hash={{ .TokenHash }}&amp;type=recovery"
       style="display:inline-block;background:#050505;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:8px;font-size:15px;font-weight:600;">
      Confirm email
    </a>
  </p>

  <p style="font-size:13.5px;line-height:1.6;color:#5F6067;margin:0 0 28px;">
    If you didn't sign up for Gradefruit, you can ignore this email.
  </p>

  <p style="font-size:12.5px;line-height:1.6;color:#6E7078;margin:0;border-top:1px solid #E6E6E9;padding-top:16px;">
    Gradefruit · Vorbereitung auf das schriftliche Mathe-Abitur in Hessen 2027<br>
    <a href="https://www.gradefruit.de" style="color:#6E7078;">www.gradefruit.de</a>
  </p>
</div>
```

---

## Schritt 4 — Prüfen

Auf gradefruit.de abmelden → **Anmelden** → **Passwort vergessen?** → eigene
Adresse eintragen. Die Mail muss von `noreply@gradefruit.de` kommen, den Text
von oben tragen und der Knopf muss auf
`https://www.gradefruit.de/passwort-neu` führen.

> Damit der Knopf dort landet, muss die Adresse zusätzlich unter
> **Authentication → URL Configuration → Redirect URLs** eingetragen sein.
