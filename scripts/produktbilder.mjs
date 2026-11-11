// Echte Produktaufnahmen für die Startseite.
//
// Die Startseite hat ihr eigenes Produkt lange mit CSS nachgezeichnet —
// Attrappen von Chat, Handy und Bibliothek. Dieses Skript nimmt stattdessen
// auf, was es wirklich gibt: scharf (2×), hell und dunkel, immer gleich
// ausgeschnitten.
//
// Aufruf:  node --env-file=.env.local scripts/produktbilder.mjs
// Voraussetzung: Dev-Server läuft auf Port 3000.

import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { mkdir } from 'node:fs/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASIS = 'http://localhost:3000';
const ZIEL = 'public/produkt';

const EMAIL = process.env.SHOT_EMAIL;
const PASSWORT = process.env.SHOT_PASSWORT;
if (!EMAIL || !PASSWORT) {
  console.error('SHOT_EMAIL und SHOT_PASSWORT setzen (Wegwerf-Konto aus create-test-user.mjs).');
  process.exit(1);
}

const warte = ms => new Promise(r => setTimeout(r, ms));

/**
 * Füllt den Lernstand des Wegwerf-Kontos mit einer glaubwürdigen Mischung.
 *
 * Ein frisches Konto steht überall auf 0 % — als Werbebild ist das schlechter
 * als gar keins. Hier wird nur der Lernfortschritt gesetzt, nie ein Kauf:
 * Zugang schaltet ausschließlich der Stripe-Webhook frei.
 */
async function lernstandFuellen() {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: nutzer } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const konto = (nutzer?.users ?? []).find(u => u.email === EMAIL);
  if (!konto) throw new Error('Wegwerf-Konto nicht gefunden');

  // Nur Analysis — das ist der frei zugängliche Teil, und genau der ist
  // auf den Aufnahmen zu sehen.
  const { data: lektionen } = await admin.from('lessons').select('id, slug').like('slug', 'an%');
  const zeilen = (lektionen ?? []).map((l, i) => {
    const r = i % 7;
    // verstanden = (1,0), wiederholen = (0,1), unklar = (1,1)
    const [understood, saved] = r < 4 ? [true, false] : r < 6 ? [false, true] : [true, true];
    return { user_id: konto.id, lesson_id: l.id, understood, saved };
  });
  if (zeilen.length) {
    await admin.from('progress').upsert(zeilen, { onConflict: 'user_id,lesson_id' });
  }
  console.log('Lernstand gefüllt:', zeilen.length, 'Lektionen');
}

/** Blendet alles aus, was auf einem Werbebild nichts verloren hat. */
async function aufraeumen(page) {
  await page.evaluate(() => {
    // Wasserzeichen trägt die E-Mail des Kontos — darf nicht auf die Webseite.
    document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
      if (/@|\.test/.test(el.textContent || '')) el.style.display = 'none';
    });
    // Das Entwickler-Abzeichen von Next.js sitzt unten links und gehört auf
    // kein Werbebild. Es lebt in einem eigenen Element außerhalb der App.
    document.querySelectorAll('nextjs-portal, [data-nextjs-dev-tools-button], #__next-dev-tools-indicator')
      .forEach(el => el.remove());
    // Laufende Animationen anhalten, damit nichts halb eingeblendet erscheint.
    document.querySelectorAll('*').forEach(el => {
      el.style.animationPlayState = 'paused';
      el.style.animationDelay = '0s';
    });
  });
}

async function anmelden(page) {
  await page.goto(BASIS, { waitUntil: 'networkidle2' });
  await warte(1500);
  await page.evaluate(() => {
    try { localStorage.setItem('gf-last-activity', String(Date.now())); } catch {}
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Anmelden');
    b?.click();
  });
  await warte(1200);
  await page.evaluate(([mail, pw]) => {
    const setze = (el, v) => {
      const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      s.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const felder = [...document.querySelectorAll('input')];
    setze(felder.find(i => i.type === 'text' || i.type === 'email'), mail);
    setze(felder.find(i => i.type === 'password'), pw);
  }, [EMAIL, PASSWORT]);
  await warte(300);
  await page.evaluate(() => {
    [...document.querySelectorAll('button[type=submit]')].find(x => /Anmelden/.test(x.textContent))?.click();
  });
  await warte(5000);
}

const AUFNAHMEN = [
  {
    name: 'loesungsweg',
    pfad: '/?view=analysis&tab=uebungen&task=an1',
    breite: 1280, hoehe: 900,
    vorher: async page => {
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find(x => /Lösung anzeigen/.test(x.textContent));
        b?.click();
      });
      await warte(1400);
    },
  },
  { name: 'themen', pfad: '/?view=themen', breite: 1280, hoehe: 900 },
  { name: 'uebersicht', pfad: '/?view=dashboard', breite: 1280, hoehe: 900 },
  { name: 'wiederholen', pfad: '/?view=review', breite: 1280, hoehe: 900 },
  { name: 'reel', pfad: '/feed', breite: 430, hoehe: 880 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--force-color-profile=srgb'],
});

await mkdir(ZIEL, { recursive: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
await lernstandFuellen();
await anmelden(page);
console.log('angemeldet');

for (const modus of ['hell', 'dunkel']) {
  await page.evaluate(m => {
    try { localStorage.setItem('gf-theme', m === 'dunkel' ? 'dark' : 'light'); } catch {}
  }, modus);

  for (const a of AUFNAHMEN) {
    await page.setViewport({ width: a.breite, height: a.hoehe, deviceScaleFactor: 2 });
    await page.goto(BASIS + a.pfad, { waitUntil: 'networkidle2' });
    await warte(2600);
    if (a.vorher) await a.vorher(page);
    await aufraeumen(page);
    await warte(400);
    // Direkt als WebP ablegen: Die PNGs waren zusammen gut 2 MB, als WebP
    // sind es 0,6 MB bei gleicher Schärfe — das lädt auf dem Handy spürbar
    // schneller und bläht das Repo nicht auf.
    const roh = await page.screenshot();
    const datei = `${ZIEL}/${a.name}-${modus}.webp`;
    await sharp(roh).webp({ quality: 90 }).toFile(datei);
    console.log('→', datei, `${a.breite * 2}×${a.hoehe * 2}`);
  }
}

await browser.close();
console.log('\nFertig.');
