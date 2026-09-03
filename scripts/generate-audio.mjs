// Einmaliger Generator: erzeugt die Sprach-mp3s fuer die Erklaervideo-Szenen
// ueber die ElevenLabs-API und legt sie unter public/audio/ ab.
//
// Aufruf (Schluessel/Stimme werden aus .env.local geladen):
//   export $(grep -v '^#' .env.local | grep '^ELEVENLABS' | xargs)
//   node scripts/generate-audio.mjs
// Optional nur bestimmte Szenen und erst als Vorschau:
//   node scripts/generate-audio.mjs --dry-run --scenes=lk-a1,lk-a2
//
// Die Texte werden DIREKT aus src/lib/scenes.ts gelesen – so koennen Szene
// und Audio nie auseinanderlaufen. Reihenfolge je Szene = exakt wie im Player:
//   0 = intro, 1..n = die Schritte (say), n+1 = outro
//
// Bereits vorhandene mp3s werden uebersprungen (spart Kontingent). Wer eine
// Szene neu vertonen will, loescht einfach die zugehoerigen Dateien.
import { writeFile, mkdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { SCENES } from '../src/lib/scenes.ts';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const sceneArg = args.find(arg => arg.startsWith('--scenes='));
const requestedIds = sceneArg
  ? sceneArg.slice('--scenes='.length).split(',').map(id => id.trim()).filter(Boolean)
  : Object.keys(SCENES);
const unknownIds = requestedIds.filter(id => !SCENES[id]);
if (unknownIds.length > 0) {
  console.error(`Unbekannte Szenen: ${unknownIds.join(', ')}`);
  process.exit(1);
}

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';

if (!dryRun && (!API_KEY || !VOICE_ID)) {
  console.error('Fehlt: ELEVENLABS_API_KEY oder ELEVENLABS_VOICE_ID (aus .env.local exportieren).');
  process.exit(1);
}

// Szene -> Liste der Segmente in Player-Reihenfolge.
function segmentsOf(scene) {
  return [scene.intro, ...scene.steps.map((s) => s.say), scene.outro];
}

const outDir = path.join(process.cwd(), 'public', 'audio');
await mkdir(outDir, { recursive: true });

let made = 0;
let skipped = 0;
let chars = 0;
let planned = 0;
let stop = false;

for (const id of requestedIds) {
  const scene = SCENES[id];
  if (stop) break;
  const segments = segmentsOf(scene);
  for (let i = 0; i < segments.length; i++) {
    const file = path.join(outDir, `${scene.id}-${i}.mp3`);
    if (existsSync(file)) {
      skipped++;
      continue;
    }
    const text = segments[i];
    planned++;
    chars += text.length;
    if (dryRun) {
      console.log(`fehlt ${scene.id}-${i}.mp3  (${text.length} Zeichen)`);
      continue;
    }
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true },
      }),
    });
    if (!res.ok) {
      const msg = await res.text();
      console.error(`\nSTOP bei ${scene.id}-${i}: HTTP ${res.status} – ${msg.slice(0, 240)}`);
      console.error('(Wahrscheinlich Kontingent aufgebraucht. Bereits erzeugte Dateien bleiben erhalten.)');
      stop = true;
      break;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.startsWith('audio/') || buf.length < 1024) {
      console.error(`\nSTOP bei ${scene.id}-${i}: Die Antwort war keine gültige Audiodatei.`);
      stop = true;
      break;
    }
    const temporaryFile = `${file}.tmp-${process.pid}`;
    await writeFile(temporaryFile, buf);
    await rename(temporaryFile, file);
    made++;
    console.log(`ok   ${scene.id}-${i}.mp3  (${buf.length} Bytes)`);
  }
}

if (dryRun) {
  console.log(`\nVorschau. Zu erzeugen: ${planned}  |  vorhanden: ${skipped}  |  Zeichen: ${chars}`);
} else {
  console.log(`\nFertig. Neu erzeugt: ${made}  |  uebersprungen: ${skipped}  |  Zeichen beauftragt: ${chars}`);
}
