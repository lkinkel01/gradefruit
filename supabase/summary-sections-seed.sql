-- Abschnitte der Zusammenfassungen als Lektionen (38 Stück).
--
-- Warum: Der Lernstatus der Zusammenfassungs-Abschnitte lag nur im lokalen
-- Speicher des Browsers. Damit gehörte er dem Gerät, nicht dem Konto — wer in
-- der App etwas als verstanden markierte und dann am Laptop die Webseite
-- öffnete, sah alles wieder unbearbeitet. Als Lektion liegt der Status auf dem
-- Server, wie bei den Übungsaufgaben auch.
--
-- Der Slug trägt die Kursstufe, weil dieselbe Überschrift („Einleitung") in GK
-- und LK vorkommt und trotzdem zwei verschiedene Abschnitte sind.
--
-- Gefahrlos mehrfach ausführbar.

insert into lessons (topic_id, slug, title, sort_order)
select t.id, v.slug, v.title, v.sort_order
from (values
  ('analysis', 'sec:analysis:gk:Einleitung', 'Einleitung', 1000),
  ('analysis', 'sec:analysis:gk:Ableitung und Grundregeln', 'Ableitung und Grundregeln', 1001),
  ('analysis', 'sec:analysis:gk:Extrempunkte', 'Extrempunkte', 1002),
  ('analysis', 'sec:analysis:gk:Wendepunkte und Monotonie', 'Wendepunkte und Monotonie', 1003),
  ('analysis', 'sec:analysis:gk:Tangente und Normale', 'Tangente und Normale', 1004),
  ('analysis', 'sec:analysis:gk:Integral und Fläche', 'Integral und Fläche', 1005),
  ('analysis', 'sec:analysis:gk:Änderungsrate und Bestand', 'Änderungsrate und Bestand', 1006),
  ('analysis', 'sec:analysis:lk:Einleitung', 'Einleitung', 1500),
  ('analysis', 'sec:analysis:lk:Produkt-, Quotienten- und Kettenregel', 'Produkt-, Quotienten- und Kettenregel', 1501),
  ('analysis', 'sec:analysis:lk:e- und ln-Funktion', 'e- und ln-Funktion', 1502),
  ('analysis', 'sec:analysis:lk:Integrationstechniken', 'Integrationstechniken', 1503),
  ('analysis', 'sec:analysis:lk:Rotationsvolumen', 'Rotationsvolumen', 1504),
  ('analysis', 'sec:analysis:lk:Funktionenscharen und Ortskurven', 'Funktionenscharen und Ortskurven', 1505),
  ('analysis', 'sec:analysis:lk:Trigonometrische Funktionen', 'Trigonometrische Funktionen', 1506),
  ('linalg', 'sec:linalg:gk:Einleitung', 'Einleitung', 1000),
  ('linalg', 'sec:linalg:gk:Vektoren und Abstände', 'Vektoren und Abstände', 1001),
  ('linalg', 'sec:linalg:gk:Skalarprodukt und Winkel', 'Skalarprodukt und Winkel', 1002),
  ('linalg', 'sec:linalg:gk:Geraden', 'Geraden', 1003),
  ('linalg', 'sec:linalg:gk:Ebenen', 'Ebenen', 1004),
  ('linalg', 'sec:linalg:gk:Abstand und Flächen', 'Abstand und Flächen', 1005),
  ('linalg', 'sec:linalg:lk:Einleitung', 'Einleitung', 1500),
  ('linalg', 'sec:linalg:lk:Kreuz- und Spatprodukt', 'Kreuz- und Spatprodukt', 1501),
  ('linalg', 'sec:linalg:lk:Lagebeziehungen und Winkel', 'Lagebeziehungen und Winkel', 1502),
  ('linalg', 'sec:linalg:lk:Abstände und Spiegelungen', 'Abstände und Spiegelungen', 1503),
  ('linalg', 'sec:linalg:lk:Kugeln', 'Kugeln', 1504),
  ('linalg', 'sec:linalg:lk:Übergangsmatrizen', 'Übergangsmatrizen', 1505),
  ('stochastik', 'sec:stochastik:gk:Einleitung', 'Einleitung', 1000),
  ('stochastik', 'sec:stochastik:gk:Grundlagen', 'Grundlagen', 1001),
  ('stochastik', 'sec:stochastik:gk:Baumdiagramme', 'Baumdiagramme', 1002),
  ('stochastik', 'sec:stochastik:gk:Bedingte Wahrscheinlichkeit', 'Bedingte Wahrscheinlichkeit', 1003),
  ('stochastik', 'sec:stochastik:gk:Erwartungswert und Streuung', 'Erwartungswert und Streuung', 1004),
  ('stochastik', 'sec:stochastik:gk:Binomialverteilung', 'Binomialverteilung', 1005),
  ('stochastik', 'sec:stochastik:lk:Einleitung', 'Einleitung', 1500),
  ('stochastik', 'sec:stochastik:lk:Binomialverteilung vertieft', 'Binomialverteilung vertieft', 1501),
  ('stochastik', 'sec:stochastik:lk:Hypothesentests', 'Hypothesentests', 1502),
  ('stochastik', 'sec:stochastik:lk:Normalapproximation', 'Normalapproximation', 1503),
  ('stochastik', 'sec:stochastik:lk:Totale Wahrscheinlichkeit und Bayes', 'Totale Wahrscheinlichkeit und Bayes', 1504),
  ('stochastik', 'sec:stochastik:lk:Weitere Verteilungen und Transformationen', 'Weitere Verteilungen und Transformationen', 1505)
) as v(topic_slug, slug, title, sort_order)
join topics t on t.slug = v.topic_slug
on conflict (topic_id, slug) do nothing;
