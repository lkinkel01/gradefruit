'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Scene, SceneGraph } from '@/lib/scenes';
import styles from './SceneModal.module.css';

interface Segment {
  say: string;
  reveal: number; // wie viele Schritte sichtbar sind
  marks: { x: number; y: number; label: string }[];
  kind: 'intro' | 'step' | 'outro';
  showResult?: boolean;
}

// Schöne, runde Achsen-Schritte (1, 2, 5, 10 …) für die Gitterlinien
function niceTicks(min: number, max: number, target = 6) {
  const span = max - min;
  if (span <= 0) return [] as number[];
  const raw = span / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = norm >= 5 ? 5 * mag : norm >= 2 ? 2 * mag : mag;
  const ticks: number[] = [];
  const start = Math.ceil(min / step) * step;
  for (let v = start; v <= max + 1e-9; v += step) {
    ticks.push(Math.abs(v) < 1e-9 ? 0 : +v.toFixed(6));
  }
  return ticks;
}

// Graph in SVG-Koordinaten umrechnen (mit Gitter, Achsen-Pfeilen und Fläche)
function buildGraph(graph: SceneGraph) {
  const W = 320;
  const H = 240;
  const pad = 30;
  const N = 160;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= N; i++) {
    const x = graph.xMin + ((graph.xMax - graph.xMin) * i) / N;
    xs.push(x);
    ys.push(graph.fn(x));
  }
  // 0-Linie immer einschließen, damit die Achsen sichtbar bleiben
  const yMin = Math.min(0, ...ys);
  const yMax = Math.max(0, ...ys);
  const padY = (yMax - yMin) * 0.14 || 1;
  const yLo = yMin - padY;
  const yHi = yMax + padY;
  const sx = (x: number) => pad + ((x - graph.xMin) / (graph.xMax - graph.xMin)) * (W - 2 * pad);
  const sy = (y: number) => H - pad - ((y - yLo) / (yHi - yLo)) * (H - 2 * pad);
  const d = xs
    .map((x, i) => `${i === 0 ? 'M' : 'L'} ${sx(x).toFixed(1)} ${sy(ys[i]).toFixed(1)}`)
    .join(' ');

  const x0 = Math.max(pad, Math.min(W - pad, sx(0)));
  const y0 = Math.max(pad, Math.min(H - pad, sy(0)));

  const gridX = niceTicks(graph.xMin, graph.xMax).map((x) => ({ x, px: sx(x) }));
  const gridY = niceTicks(yLo, yHi).map((y) => ({ y, py: sy(y) }));

  // Fläche unter der Kurve (Integral) als geschlossener Pfad
  let shade: string | null = null;
  if (graph.shadeFrom != null && graph.shadeTo != null) {
    const a = graph.shadeFrom;
    const b = graph.shadeTo;
    const M = 60;
    const pts: string[] = [`M ${sx(a).toFixed(1)} ${y0.toFixed(1)}`];
    for (let i = 0; i <= M; i++) {
      const x = a + ((b - a) * i) / M;
      pts.push(`L ${sx(x).toFixed(1)} ${sy(graph.fn(x)).toFixed(1)}`);
    }
    pts.push(`L ${sx(b).toFixed(1)} ${y0.toFixed(1)} Z`);
    shade = pts.join(' ');
  }

  return { W, H, pad, d, sx, sy, x0, y0, gridX, gridY, shade };
}

interface PlayerProps {
  scene: Scene;
  autoPlay?: boolean; // startet die Wiedergabe direkt nach dem Einbetten (Lernfeed)
  onClose?: () => void;
  variant?: 'default' | 'reel';
}

// Der eigentliche Player – wiederverwendbar: im Modal (Themenseiten, Videos)
// und direkt eingebettet im Lernfeed (Inline-Wiedergabe wie bei TikTok).
export function ScenePlayer({ scene, autoPlay = false, onClose, variant = 'default' }: PlayerProps) {
  const [seg, setSeg] = useState(0);
  const [playing, setPlaying] = useState(false);
  // Wiedergabegeschwindigkeit — gilt für Stimme und stumme Segmente.
  const [rate, setRate] = useState(1);
  const rateRef = useRef(1);
  const [frac, setFrac] = useState(0); // Fortschritt innerhalb des aktuellen Segments (0..1)
  const fracRef = useRef(0);           // spiegelt frac für Gesten-/Resume-Logik (ohne Re-Render)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playToken = useRef(0);

  // TikTok-Gesten im Reel: Tippen = Play/Pause, Doppeltippen links/rechts =
  // ein Stück vor/zurück springen, Gedrückthalten = flüssiges Spulen. Die
  // Position als Fließkommazahl seg+frac (posRef) macht das Spulen stufenlos.
  const segRef = useRef(0);
  const posRef = useRef(0);
  const gSide = useRef(1);
  const gStart = useRef<{ x: number; y: number } | null>(null);
  const gMoved = useRef(false);
  const gSeeking = useRef(false);
  const gHold = useRef<number | null>(null);
  const gSeek = useRef<number | null>(null);
  const gTap = useRef<number | null>(null);
  const gLastTap = useRef<{ t: number; side: number } | null>(null);

  // Segmente aus der Szene bauen: Intro -> jeder Schritt -> Outro
  const segments = useMemo<Segment[]>(() => {
    const segs: Segment[] = [];
    segs.push({ say: scene.intro, reveal: 0, marks: [], kind: 'intro' });
    const acc: { x: number; y: number; label: string }[] = [];
    scene.steps.forEach((s, i) => {
      if (s.mark) acc.push(s.mark);
      segs.push({ say: s.say, reveal: i + 1, marks: [...acc], kind: 'step' });
    });
    segs.push({
      say: scene.outro,
      reveal: scene.steps.length,
      marks: [...acc],
      kind: 'outro',
      showResult: true,
    });
    return segs;
  }, [scene]);

  const stopNarration = useCallback(() => {
    playToken.current++;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  // Beim Szenenwechsel/Abbau zurücksetzen
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSeg(0);
      setPlaying(false);
      setFrac(0);
      segRef.current = 0;
      fracRef.current = 0;
      posRef.current = 0;
    });
    return () => {
      cancelAnimationFrame(frame);
      stopNarration();
    };
  }, [scene, stopNarration]);

  // segRef/fracRef spiegeln den aktuellen Stand, damit die Gesten-Handler ihn
  // synchron lesen können; beim Abbau alle Gesten-Timer aufräumen.
  useEffect(() => { segRef.current = seg; }, [seg]);
  useEffect(() => { fracRef.current = frac; }, [frac]);
  useEffect(() => () => {
    if (gHold.current) window.clearTimeout(gHold.current);
    if (gSeek.current) window.clearInterval(gSeek.current);
    if (gTap.current) window.clearTimeout(gTap.current);
  }, []);

  // ESC schließt den Player (nur wenn es ein Schließen gibt)
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Stummer Ablauf mit Untertiteln: Lesedauer aus der Textlänge schätzen.
  // Ersetzt die frühere Roboter-Browserstimme vollständig.
  const advanceSilently = (text: string, token: number, finish: () => void, startFrac = 0) => {
    if (token !== playToken.current) return finish();
    const duration = Math.max(2600, text.length * 72) / rateRef.current;
    // Startversatz verrechnen, damit ein resume/scrub mitten im Segment fortsetzt.
    const started = performance.now() - Math.max(0, Math.min(0.999, startFrac)) * duration;
    const iv = setInterval(() => {
      if (token !== playToken.current) {
        clearInterval(iv);
        finish();
        return;
      }
      const p = (performance.now() - started) / duration;
      if (p >= 1) {
        clearInterval(iv);
        finish();
      } else {
        setFrac(p);
        fracRef.current = p;
      }
    }, 120);
  };

  // Ein Segment abspielen: mp3 mit menschlicher Stimme wenn vorhanden,
  // sonst (oder bei blockiertem Autoplay-Ton) stumm mit Untertiteln.
  const narrate = (text: string, file: string, token: number, startFrac = 0) =>
    new Promise<void>((resolve) => {
      let done = false;
      setFrac(startFrac);
      fracRef.current = startFrac;
      const finish = () => {
        if (!done) {
          done = true;
          if (token === playToken.current) { setFrac(1); fracRef.current = 1; }
          resolve();
        }
      };
      if (scene.hasAudio) {
        const audio = new Audio(`/audio/${file}.mp3`);
        audio.playbackRate = rateRef.current;
        audioRef.current = audio;
        // Bei resume/scrub an die passende Stelle springen, sobald die Dauer bekannt ist.
        const applySeek = () => {
          if (startFrac > 0 && audio.duration && isFinite(audio.duration)) {
            try { audio.currentTime = startFrac * audio.duration; } catch { /* noch nicht seekbar */ }
          }
        };
        audio.onloadedmetadata = applySeek;
        if (audio.readyState >= 1) applySeek();
        audio.onended = finish;
        audio.ontimeupdate = () => {
          if (token === playToken.current && audio.duration) {
            const p = Math.min(1, audio.currentTime / audio.duration);
            setFrac(p);
            fracRef.current = p;
          }
        };
        audio.onerror = () => advanceSilently(text, token, finish, startFrac);
        // Ton wird versucht; blockiert der Browser den Ton (kein Gesten-Kontext),
        // läuft das Segment stumm weiter — ohne sichtbaren Hinweis, wie bei TikTok.
        audio.play().catch(() => advanceSilently(text, token, finish, startFrac));
      } else {
        advanceSilently(text, token, finish, startFrac);
      }
    });

  const runFrom = useCallback(
    async (start: number, startFrac = 0) => {
      const token = ++playToken.current;
      setPlaying(true);
      for (let i = start; i < segments.length; i++) {
        if (token !== playToken.current) return;
        segRef.current = i;
        setSeg(i);
        await narrate(segments[i].say, `${scene.id}-${i}`, token, i === start ? startFrac : 0);
        if (token !== playToken.current) return;
        await new Promise((r) => setTimeout(r, 350));
      }
      if (token === playToken.current) setPlaying(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scene, segments],
  );

  // Direktstart im Lernfeed: Wiedergabe beginnt mit dem Einbetten.
  useEffect(() => {
    if (!autoPlay) return;
    const frame = requestAnimationFrame(() => {
      void runFrom(0);
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, scene]);

  // Tastatur: Leertaste = Play/Pause, Pfeile = vor/zurück
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.key === ' ' || e.code === 'Space') {
        if (tag === 'BUTTON') return; // fokussierter Button reagiert selbst
        e.preventDefault();
        if (playing) {
          stopNarration();
          setPlaying(false);
        } else {
          runFrom(seg, fracRef.current);
        }
      } else if (e.key === 'ArrowRight') {
        stopNarration();
        setPlaying(false);
        setFrac(0);
        fracRef.current = 0;
        setSeg((s) => Math.min(s + 1, segments.length - 1));
      } else if (e.key === 'ArrowLeft') {
        stopNarration();
        setPlaying(false);
        setFrac(0);
        fracRef.current = 0;
        setSeg((s) => Math.max(s - 1, 0));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing, seg, segments.length, runFrom, stopNarration]);

  const current = segments[seg] ?? segments[0];
  const activeStep = current.kind === 'step' ? current.reveal - 1 : -1;
  const g = scene.graph ? buildGraph(scene.graph) : null;
  const pct = Math.min(100, ((seg + frac) / segments.length) * 100);

  // Weiterspielen genau an der pausierten Stelle (nicht das Segment neu starten).
  const play = () => runFrom(segRef.current, fracRef.current);
  const pause = () => {
    stopNarration();
    setPlaying(false);
  };
  const togglePlay = () => (playing ? pause() : play());
  // Geschwindigkeit im Kreis durchschalten; laufendes Audio zieht sofort mit.
  const RATES = [1, 1.25, 1.5, 2];
  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rateRef.current) + 1) % RATES.length];
    rateRef.current = next;
    setRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };
  const goNext = () => {
    stopNarration();
    setPlaying(false);
    setFrac(0);
    fracRef.current = 0;
    setSeg((s) => Math.min(s + 1, segments.length - 1));
  };
  const goPrev = () => {
    stopNarration();
    setPlaying(false);
    setFrac(0);
    fracRef.current = 0;
    setSeg((s) => Math.max(s - 1, 0));
  };
  const restart = () => {
    stopNarration();
    setSeg(0);
    setPlaying(false);
    setFrac(0);
    segRef.current = 0;
    fracRef.current = 0;
    posRef.current = 0;
  };

  // ---- Reel-Gesten: stufenloses Spulen über eine Fließkomma-Position ----
  // Position ist seg+frac. applyPos setzt daraus Segment und Segment-Fortschritt,
  // sodass Schritte und Fortschrittsbalken beim Spulen flüssig mitlaufen.
  const applyPos = (pos: number) => {
    const maxPos = segments.length - 0.001;
    const clamped = Math.max(0, Math.min(pos, maxPos));
    posRef.current = clamped;
    const s = Math.min(segments.length - 1, Math.floor(clamped));
    const f = Math.max(0, Math.min(0.999, clamped - s));
    segRef.current = s;
    fracRef.current = f;
    setSeg(s);
    setFrac(f);
  };

  const stopSeekInterval = () => {
    if (gSeek.current) { window.clearInterval(gSeek.current); gSeek.current = null; }
  };
  const clearHold = () => {
    if (gHold.current) { window.clearTimeout(gHold.current); gHold.current = null; }
  };

  // Gedrückthalten: flüssig in eine Richtung spulen (links zurück, rechts vor).
  const startSeek = (dir: number) => {
    stopNarration();
    setPlaying(false);
    gSeeking.current = true;
    posRef.current = segRef.current + fracRef.current;
    stopSeekInterval();
    gSeek.current = window.setInterval(() => {
      applyPos(posRef.current + dir * 0.06);
    }, 55);
  };
  const stopSeek = (resume: boolean) => {
    stopSeekInterval();
    gSeeking.current = false;
    if (resume) runFrom(segRef.current, fracRef.current);
  };

  // Doppeltippen: ein Stück vor/zurück springen und weiterspielen.
  const seekBy = (delta: number) => {
    stopNarration();
    applyPos(segRef.current + fracRef.current + delta);
    runFrom(segRef.current, fracRef.current);
  };

  const onReelPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    gSide.current = e.clientX - rect.left < rect.width / 2 ? -1 : 1;
    gStart.current = { x: e.clientX, y: e.clientY };
    gMoved.current = false;
    gSeeking.current = false;
    clearHold();
    stopSeekInterval();
    // Nach ~300 ms Halten beginnt das flüssige Spulen.
    gHold.current = window.setTimeout(() => startSeek(gSide.current), 300);
  };

  const onReelPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gStart.current || gSeeking.current) return;
    if (Math.hypot(e.clientX - gStart.current.x, e.clientY - gStart.current.y) > 12) {
      // Vertikales Wischen (Reel-Wechsel): keine Tipp-/Halte-Geste auslösen.
      gMoved.current = true;
      clearHold();
    }
  };

  const onReelPointerEnd = () => {
    clearHold();
    if (gSeeking.current) { stopSeek(true); gStart.current = null; gMoved.current = false; return; }
    gStart.current = null;
    if (gMoved.current) { gMoved.current = false; return; }
    const side = gSide.current;
    const now = performance.now();
    if (gLastTap.current && now - gLastTap.current.t < 300 && gLastTap.current.side === side) {
      // Doppeltippen rechts = vor, links = zurück.
      if (gTap.current) { window.clearTimeout(gTap.current); gTap.current = null; }
      gLastTap.current = null;
      seekBy(side * 0.6);
    } else {
      // Einfaches Tippen: kurz warten, ob ein zweiter Tipp folgt; sonst Play/Pause.
      gLastTap.current = { t: now, side };
      gTap.current = window.setTimeout(() => {
        gLastTap.current = null;
        togglePlay();
      }, 300);
    }
  };

  const onReelPointerCancel = () => {
    clearHold();
    if (gSeeking.current) stopSeek(true);
    gMoved.current = false;
    gStart.current = null;
  };

  return (
    <div className={`${styles.player} ${variant === 'reel' ? styles.reelPlayer : ''}`}>
      <div className={styles.head}>
        {variant !== 'reel' && (
          <>
            <span className={styles.badge} style={{ background: scene.color }}>
              {scene.topic}
            </span>
            <span className={styles.htitle}>{scene.title}</span>
          </>
        )}
        {onClose && (
          <button className={styles.close} onClick={onClose} aria-label="Schließen">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.left}>
          {scene.func && (
            <div className={styles.func} style={{ borderColor: `${scene.color}40` }}>
              {scene.func}
            </div>
          )}

          <div className={styles.steps}>
            {scene.steps.slice(0, current.reveal).map((step, i) => (
              <div
                key={i}
                className={`${styles.step} ${i === activeStep ? styles.stepActive : styles.stepDone}`}
                style={
                  i === activeStep ? { borderColor: scene.color, background: `${scene.color}12` } : undefined
                }
              >
                <div className={styles.stepNum} style={{ background: scene.color }}>
                  {i + 1}
                </div>
                <div className={styles.stepBody}>
                  <div className={styles.stepTitle}>{step.title}</div>
                  {step.math && <div className={styles.stepMath}>{step.math}</div>}
                </div>
              </div>
            ))}
          </div>

          {current.showResult && scene.result && (
            <div className={styles.result} style={{ background: scene.color }}>
              {scene.result}
            </div>
          )}
        </div>

        {g && (
          <div className={styles.right}>
            <svg className={styles.graph} viewBox={`0 0 ${g.W} ${g.H}`} key={scene.id}>
              <defs>
                <marker id="ahead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0 0 L10 5 L0 10 z" className={styles.arrowHead} />
                </marker>
              </defs>

              {/* Gitter */}
              {g.gridX.map((t, i) => (
                <line key={`gx${i}`} x1={t.px} y1={g.pad} x2={t.px} y2={g.H - g.pad} className={styles.gridline} />
              ))}
              {g.gridY.map((t, i) => (
                <line key={`gy${i}`} x1={g.pad} y1={t.py} x2={g.W - g.pad} y2={t.py} className={styles.gridline} />
              ))}

              {/* Fläche unter der Kurve (Integral) */}
              {g.shade && <path d={g.shade} className={styles.shade} fill={scene.color} />}

              {/* Achsen mit Pfeilspitze */}
              <line x1={g.pad} y1={g.y0} x2={g.W - g.pad} y2={g.y0} className={styles.axis} markerEnd="url(#ahead)" />
              <line x1={g.x0} y1={g.H - g.pad} x2={g.x0} y2={g.pad} className={styles.axis} markerEnd="url(#ahead)" />

              {/* Zahlen an den Achsen */}
              {g.gridX.map((t, i) =>
                t.x === 0 ? null : (
                  <text key={`lx${i}`} x={t.px} y={g.y0 + 12} className={styles.gridlabel} textAnchor="middle">
                    {Number.isInteger(t.x) ? t.x : t.x.toFixed(1)}
                  </text>
                ),
              )}
              {g.gridY.map((t, i) =>
                t.y === 0 ? null : (
                  <text key={`ly${i}`} x={g.x0 - 6} y={t.py + 3} className={styles.gridlabel} textAnchor="end">
                    {Number.isInteger(t.y) ? t.y : t.y.toFixed(1)}
                  </text>
                ),
              )}
              <text x={g.W - g.pad - 2} y={g.y0 - 7} className={styles.axisLabel} textAnchor="end">
                x
              </text>
              <text x={g.x0 + 9} y={g.pad + 3} className={styles.axisLabel}>
                y
              </text>

              {/* Kurve */}
              <path d={g.d} pathLength={1} className={styles.curve} stroke={scene.color} />

              {/* Markierte Punkte */}
              {current.marks.map((m, i) => (
                <g key={i} className={styles.markG}>
                  <circle cx={g.sx(m.x)} cy={g.sy(m.y)} r={5} fill={scene.color} stroke="#fff" strokeWidth={2} />
                  <text x={g.sx(m.x)} y={g.sy(m.y) - 10} className={styles.markLabel} textAnchor="middle">
                    {m.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      {variant === 'reel' ? (
        <>
          {/* TikTok-Gesten: die ganze Bühne ist tipp-/haltbar. */}
          <div
            className={styles.reelGestures}
            onPointerDown={onReelPointerDown}
            onPointerMove={onReelPointerMove}
            onPointerUp={onReelPointerEnd}
            onPointerCancel={onReelPointerCancel}
            onPointerLeave={onReelPointerCancel}
            onContextMenu={(e) => e.preventDefault()}
            aria-hidden="true"
          />
          {!playing && (
            <div className={styles.reelPlayIndicator} aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><polygon points="6 4 20 12 6 20 6 4" /></svg>
            </div>
          )}
          {/* Titel unten wie ein Creator-Name bei TikTok. */}
          <div className={styles.reelMeta}>
            <span className={styles.reelTopic}>{scene.topic}</span>
            <strong className={styles.reelTitle}>{scene.title}</strong>
          </div>
        </>
      ) : (
        <div className={styles.caption}>{current.say}</div>
      )}

      <div className={styles.progressbar}>
        <div className={styles.pfill} style={{ transform: `scaleX(${pct / 100})`, background: scene.color }} />
      </div>

      {variant !== 'reel' && (
      <div className={styles.foot}>
        <button className={styles.ctrl} onClick={goPrev} disabled={seg === 0} aria-label="Zurück">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="11 19 2 12 11 5 11 19" />
            <polygon points="22 19 13 12 22 5 22 19" />
          </svg>
        </button>

        <button className={styles.play} style={{ background: scene.color }} onClick={togglePlay}>
          {playing ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          )}
        </button>

        <button
          className={styles.ctrl}
          onClick={goNext}
          disabled={seg === segments.length - 1}
          aria-label="Weiter"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 5 22 12 13 19 13 5" />
            <polygon points="2 5 11 12 2 19 2 5" />
          </svg>
        </button>

        <button className={styles.ctrl} onClick={restart} aria-label="Von vorne">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10" />
          </svg>
        </button>

        <button
          className={`${styles.ctrl} ${styles.rate}`}
          onClick={cycleRate}
          aria-label={`Wiedergabegeschwindigkeit ändern, aktuell ${rate}-fach`}
          title="Geschwindigkeit"
        >
          {rate}×
        </button>

        <div className={styles.progress}>
          <div className={styles.dots}>
            {segments.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === seg ? styles.dotOn : ''}`}
                style={i === seg ? { background: scene.color } : undefined}
              />
            ))}
          </div>
          <span className={styles.count}>
            {seg + 1} / {segments.length}
          </span>
        </div>
      </div>
      )}
    </div>
  );
}

// Modal-Hülle für Themenseiten und Videos. Wird per Portal direkt an
// document.body gehängt: Eltern-Seiten tragen eine Einstiegs-Animation
// (transform), die sonst das position:fixed-Modal einfängt und unter den
// sichtbaren Bereich schiebt („Video erst nach Scrollen sichtbar"-Bug).
export default function SceneModal({ scene, onClose }: { scene: Scene | null; onClose: () => void }) {
  if (!scene) return null;
  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <ScenePlayer scene={scene} onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
