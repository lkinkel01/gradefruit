-- ============================================================
--  Gradefruit – Leistungskurs als eigenen Kurs anlegen
--  Legt den Kurs "mathe-lk" an, damit der LK getrennt vom
--  Grundkurs gekauft werden kann (eigener Kauf, eigener Preis).
--
--  Wichtig: Der LK braucht KEINE eigenen Themen/Aufgaben in der
--  Datenbank. Die LK-Aufgaben liegen weiterhin unter den Themen
--  des Kurses "mathe-gk" (an*/la* zusammen unter "analysis" usw.),
--  damit die Fortschritts-Zuordnung eindeutig bleibt. Dieser Kurs
--  dient nur dazu, den Kauf "Leistungskurs" sauber zuzuordnen.
--
--  So führst du es aus:
--    Supabase Dashboard  ->  SQL Editor  ->  "New query"
--    Den GANZEN Inhalt dieser Datei einfügen  ->  "Run"
--  Das Skript kann gefahrlos mehrmals ausgeführt werden.
-- ============================================================

insert into public.courses (slug, title, description, price_cents)
values (
  'mathe-lk',
  'Mathe-Abi Hessen 2027 – Leistungskurs',
  'Komplette Vorbereitung auf das schriftliche Mathe-Abitur (Leistungskurs) in Hessen.',
  9900
)
on conflict (slug) do nothing;

-- ============================================================
--  Fertig. Kontrolle (optional):
--    select slug, title, price_cents from public.courses order by slug;
--  Erwartung:  mathe-gk  und  mathe-lk
-- ============================================================
