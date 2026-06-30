-- ============================================================
--  Gradefruit – Aufgaben (lessons) neu befüllen
--  Macht "Verstanden?" und "Speichern" für ALLE aktuellen
--  Aufgaben funktionsfähig (Grundkurs + Leistungskurs).
--
--  So führst du es aus:
--    Supabase Dashboard  ->  SQL Editor  ->  "New query"
--    Den GANZEN Inhalt dieser Datei einfügen  ->  "Run"
--  Das Skript kann gefahrlos mehrmals ausgeführt werden.
-- ============================================================


-- ------------------------------------------------------------
-- 1) Alte Demo-Aufgaben entfernen
--    (a1/a2/a3, l1/l2, s1/s2 gibt es in der App nicht mehr;
--     sie verfälschen sonst die Fortschritts-Zähler.)
--    Zugehörige Fortschritts-Zeilen werden automatisch mitgelöscht.
-- ------------------------------------------------------------
delete from public.lessons l
using public.topics tp, public.courses c
where l.topic_id = tp.id
  and tp.course_id = c.id
  and c.slug = 'mathe-gk'
  and l.slug in ('a1', 'a2', 'a3', 'l1', 'l2', 's1', 's2');


-- ------------------------------------------------------------
-- 2) Aktuelle Aufgaben eintragen
--    slug = Aufgaben-ID aus der App, title = Themen-Kategorie.
--    sort_order 1..   = Grundkurs,  101..  = Leistungskurs.
--    Hinweis: GK und LK liegen vorerst unter denselben Themen
--    des Kurses "mathe-gk". Wird LK später ein eigener Kurs,
--    wandern die LK-Zeilen in den neuen Kurs um.
-- ------------------------------------------------------------
insert into public.lessons (topic_id, slug, title, sort_order)
select tp.id, l.slug, l.title, l.sort_order
from public.topics tp
join public.courses c on c.id = tp.course_id and c.slug = 'mathe-gk'
join (values
  -- Analysis · Grundkurs
  ('analysis',   'an1',  'Extrempunkte',                    1),
  ('analysis',   'an2',  'Wendepunkte',                     2),
  ('analysis',   'an3',  'Kurvendiskussion',                3),
  ('analysis',   'an4',  'Tangente',                        4),
  ('analysis',   'an5',  'Bestimmtes Integral',             5),
  ('analysis',   'an6',  'Fläche zur x-Achse',              6),
  ('analysis',   'an7',  'Fläche zwischen zwei Kurven',     7),
  ('analysis',   'an8',  'Mittelwert (Integral)',           8),
  ('analysis',   'an9',  'Stammfunktion durch Punkt',       9),
  ('analysis',   'an10', 'Extrempunkt (e-Funktion)',        10),
  ('analysis',   'an11', 'Monotonie',                       11),
  ('analysis',   'an12', 'Steckbriefaufgabe',               12),
  ('analysis',   'an13', 'Änderungsrate',                   13),
  ('analysis',   'an14', 'Extremwertproblem',               14),
  ('analysis',   'an15', 'Sachkontext',                     15),
  -- Analysis · Leistungskurs
  ('analysis',   'la1',  'Produktregel (e-Funktion)',       101),
  ('analysis',   'la2',  'Kettenregel',                     102),
  ('analysis',   'la3',  'Quotientenregel',                 103),
  ('analysis',   'la4',  'Ableitung mit ln',                104),
  ('analysis',   'la5',  'Extrempunkte (e-Funktion)',       105),
  ('analysis',   'la6',  'Wendestellen (e-Funktion)',       106),
  ('analysis',   'la7',  'Kurvendiskussion (e-Funktion)',   107),
  ('analysis',   'la8',  'Tangente (e-Funktion)',           108),
  ('analysis',   'la9',  'Integral (e-Funktion)',           109),
  ('analysis',   'la10', 'Fläche zwischen Kurven',          110),
  ('analysis',   'la11', 'Rotationsvolumen',                111),
  ('analysis',   'la12', 'Funktionenschar',                 112),

  -- Lineare Algebra & Geometrie · Grundkurs
  ('linalg',     'lg1',  'Betrag & Abstand',                1),
  ('linalg',     'lg2',  'Mittelpunkt',                     2),
  ('linalg',     'lg3',  'Skalarprodukt & Winkel',          3),
  ('linalg',     'lg4',  'Orthogonalität',                  4),
  ('linalg',     'lg5',  'Kollinearität',                   5),
  ('linalg',     'lg6',  'Gerade & Punktprobe',             6),
  ('linalg',     'lg7',  'Schnittpunkt zweier Geraden',     7),
  ('linalg',     'lg8',  'Rechtwinkliges Dreieck',          8),
  ('linalg',     'lg9',  'Parallelogramm',                  9),
  ('linalg',     'lg10', 'Dreiecksfläche (Kreuzprodukt)',   10),
  ('linalg',     'lg11', 'Ebene (Koordinatenform)',         11),
  ('linalg',     'lg12', 'Spurpunkte einer Ebene',          12),
  ('linalg',     'lg13', 'Schnitt Gerade–Ebene',            13),
  ('linalg',     'lg14', 'Abstand Punkt–Ebene',             14),
  -- Lineare Algebra & Geometrie · Leistungskurs
  ('linalg',     'll1',  'Ebene durch 3 Punkte',            101),
  ('linalg',     'll2',  'Schnittgerade zweier Ebenen',     102),
  ('linalg',     'll3',  'Winkel zwischen Ebenen',          103),
  ('linalg',     'll4',  'Winkel Gerade–Ebene',             104),
  ('linalg',     'll5',  'Windschiefe Geraden',             105),
  ('linalg',     'll6',  'Abstand Punkt–Gerade',            106),
  ('linalg',     'll7',  'Abstand windschiefer Geraden',    107),
  ('linalg',     'll8',  'Lotfußpunkt',                     108),
  ('linalg',     'll9',  'Spiegelpunkt an Ebene',           109),
  ('linalg',     'll10', 'Lineares Gleichungssystem',       110),
  ('linalg',     'll11', 'Übergangsmatrix',                 111),
  ('linalg',     'll12', 'Volumen (Spatprodukt)',           112),

  -- Stochastik · Grundkurs
  ('stochastik', 'st1',  'Laplace-Wahrscheinlichkeit',      1),
  ('stochastik', 'st2',  'Baumdiagramm (ohne Zurücklegen)', 2),
  ('stochastik', 'st3',  'Gegenwahrscheinlichkeit',         3),
  ('stochastik', 'st4',  'Kombinatorik',                    4),
  ('stochastik', 'st5',  'Erwartungswert',                  5),
  ('stochastik', 'st6',  'Standardabweichung',              6),
  ('stochastik', 'st7',  'Faires Spiel',                    7),
  ('stochastik', 'st8',  'Unabhängigkeit',                  8),
  ('stochastik', 'st9',  'Vierfeldertafel',                 9),
  ('stochastik', 'st10', 'Satz von Bayes',                  10),
  ('stochastik', 'st11', 'Binomialverteilung P(X=k)',       11),
  ('stochastik', 'st12', 'Binomial (mindestens eins)',      12),
  ('stochastik', 'st13', 'Binomial: μ und σ',               13),
  ('stochastik', 'st14', 'Binomial (mindestens 8)',         14),
  -- Stochastik · Leistungskurs
  ('stochastik', 'sl1',  'σ-Regeln (Binomial)',             101),
  ('stochastik', 'sl2',  'Erwartungswert & σ',              102),
  ('stochastik', 'sl3',  'Normalapproximation',             103),
  ('stochastik', 'sl4',  'Mindestens-eins (Binomial)',      104),
  ('stochastik', 'sl5',  'Kleinstes n bestimmen',           105),
  ('stochastik', 'sl6',  'Konfidenzintervall',              106),
  ('stochastik', 'sl7',  'Hypothesentest · Fehler 1. Art',  107),
  ('stochastik', 'sl8',  'Hypothesentest · Fehler 2. Art',  108),
  ('stochastik', 'sl9',  'Totale W. & Bayes',               109),
  ('stochastik', 'sl10', 'Kumulierte Binomialverteilung',   110),
  ('stochastik', 'sl11', 'Zweiseitiger Test',               111),
  ('stochastik', 'sl12', 'Erwartungswert & σ (allg. ZG)',   112)
) as l(topic_slug, slug, title, sort_order) on l.topic_slug = tp.slug
on conflict (topic_id, slug) do nothing;

-- ============================================================
--  Fertig. Kontrolle (optional):
--    select tp.slug as thema, count(*) as aufgaben
--    from public.lessons l join public.topics tp on tp.id = l.topic_id
--    group by tp.slug order by tp.slug;
--  Erwartung:  analysis 27,  linalg 26,  stochastik 26
-- ============================================================
