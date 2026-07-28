import WidgetKit
import SwiftUI

// Countdown bis zur schriftlichen Mathe-Abiturprüfung auf dem Home-Bildschirm.
//
// Die Zahl ist der Kern von Gradefruit: Sie macht aus "irgendwann im nächsten
// Jahr" etwas Greifbares. Auf dem Home-Bildschirm wirkt sie, ohne dass jemand
// die App öffnen muss — genau das, was ein Widget kann und eine Website nicht.
//
// Termin und Quelle stehen in src/lib/exam.ts. Ändert sich der Termin dort,
// muss er hier mitgeändert werden.

private let pruefungstermin: Date = {
    var teile = DateComponents()
    teile.year = 2027
    teile.month = 5
    teile.day = 5
    teile.hour = 9
    return Calendar.current.date(from: teile) ?? Date()
}()

private func verbleibendeTage(ab jetzt: Date = Date()) -> Int {
    let kalender = Calendar.current
    let vonTag = kalender.startOfDay(for: jetzt)
    let bisTag = kalender.startOfDay(for: pruefungstermin)
    return max(0, kalender.dateComponents([.day], from: vonTag, to: bisTag).day ?? 0)
}

struct CountdownEintrag: TimelineEntry {
    let date: Date
    let tage: Int
}

struct Zeitplan: TimelineProvider {
    func placeholder(in context: Context) -> CountdownEintrag {
        CountdownEintrag(date: Date(), tage: verbleibendeTage())
    }

    func getSnapshot(in context: Context, completion: @escaping (CountdownEintrag) -> Void) {
        completion(CountdownEintrag(date: Date(), tage: verbleibendeTage()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CountdownEintrag>) -> Void) {
        // Ein Eintrag pro Tag für die nächste Woche. Danach holt iOS von selbst
        // neue Einträge — sparsamer als stündliches Nachfragen und für eine
        // Tageszahl völlig ausreichend.
        let kalender = Calendar.current
        let mitternacht = kalender.startOfDay(for: Date())

        var eintraege: [CountdownEintrag] = []
        for tag in 0..<7 {
            guard let datum = kalender.date(byAdding: .day, value: tag, to: mitternacht) else { continue }
            eintraege.append(CountdownEintrag(date: datum, tage: verbleibendeTage(ab: datum)))
        }

        completion(Timeline(entries: eintraege, policy: .atEnd))
    }
}

struct GradefruitWidgetEntryView: View {
    var entry: Zeitplan.Entry
    @Environment(\.widgetFamily) private var groesse

    private var akzent: Color { Color(red: 0.863, green: 0.353, blue: 0.082) }

    var body: some View {
        switch groesse {
        case .systemMedium:
            HStack(alignment: .center, spacing: 18) {
                zahl
                VStack(alignment: .leading, spacing: 4) {
                    Text("bis zum Mathe-Abi")
                        .font(.system(size: 15, weight: .semibold))
                    Text("Schriftliche Prüfung am 5. Mai 2027")
                        .font(.system(size: 12))
                        .foregroundStyle(.secondary)
                }
                Spacer(minLength: 0)
            }
            .containerBackground(for: .widget) { Color(.systemBackground) }

        default:
            VStack(alignment: .leading, spacing: 2) {
                zahl
                Text(entry.tage == 1 ? "Tag bis zum Abi" : "Tage bis zum Abi")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .containerBackground(for: .widget) { Color(.systemBackground) }
        }
    }

    private var zahl: some View {
        Text("\(entry.tage)")
            .font(.system(size: 44, weight: .bold, design: .serif))
            .foregroundStyle(akzent)
            .minimumScaleFactor(0.6)
            .lineLimit(1)
    }
}

struct GradefruitWidget: Widget {
    let kind: String = "GradefruitWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Zeitplan()) { entry in
            GradefruitWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Countdown")
        .description("Zeigt, wie viele Tage bis zur schriftlichen Mathe-Abiturprüfung bleiben.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
