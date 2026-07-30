// Verknüpft die Domain mit der iPhone-App.
//
// WARUM: Im Browser bietet iOS gespeicherte Zugangsdaten von selbst an — Safari
// ist der Passwortspeicher. Die App zeigt dieselbe Seite, aber in ihrem eigenen
// Fenster (WKWebView), und dort rückt iOS gespeicherte Passwörter nur heraus,
// wenn App und Domain nachweislich zusammengehören. Der Nachweis besteht aus
// zwei Hälften: dieser Datei hier auf der Domain und der Berechtigung
// „Associated Domains" in der App. Fehlt eine, bleibt das Feld leer — genau das
// Verhalten, das Leon in der App gesehen hat.
//
// Ausgeliefert wird sie unter `/.well-known/apple-app-site-association`
// (Umleitung in next.config.ts). Ohne Endung, mit `application/json`, ohne
// Weiterleitung — Apple akzeptiert sonst nichts.
//
// `8UCNVYHTTD` ist Leons Apple-Team, `de.gradefruit.app` die Bundle-ID. Beides
// steht offen in jeder App und ist kein Geheimnis.

export const runtime = 'nodejs';
export const dynamic = 'force-static';

const APP_ID = '8UCNVYHTTD.de.gradefruit.app';

export function GET() {
  return new Response(
    JSON.stringify({
      // Passwörter aus dem iPhone-Schlüsselbund in der App anbieten.
      webcredentials: { apps: [APP_ID] },
      // Bewusst noch keine `applinks`: Solange kein Link aus einer Mail oder
      // Nachricht in die App springen soll, wäre das eine Behauptung ohne
      // Gegenstück.
    }),
    {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=3600',
      },
    },
  );
}
