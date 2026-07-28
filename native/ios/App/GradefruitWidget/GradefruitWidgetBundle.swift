import WidgetKit
import SwiftUI

// Nur das Countdown-Widget. Das mitgelieferte Control-Widget wurde entfernt —
// es hätte nichts zu steuern gehabt.
@main
struct GradefruitWidgetBundle: WidgetBundle {
    var body: some Widget {
        GradefruitWidget()
    }
}
