import UIKit

/// Screenshot- und Aufnahmeschutz für iOS.
///
/// iOS kennt kein FLAG_SECURE wie Android. Was es gibt, sind zwei Bausteine,
/// und zusammen ergeben sie das Verhalten, das man von WhatsApp kennt:
///
/// 1. **Screenshots kommen leer heraus.** Ein `UITextField` mit
///    `isSecureTextEntry` besitzt eine Ebene, die iOS beim Abfotografieren des
///    Bildschirms grundsätzlich auslässt. Hängt man den echten Inhalt in genau
///    diese Ebene ein, ist er auf dem Bildschirm normal zu sehen, auf dem
///    Screenshot aber nicht. Der Screenshot lässt sich nicht verhindern — sein
///    Ergebnis ist nur unbrauchbar.
///
/// 2. **Bildschirmaufnahme wird erkannt.** `UIScreen.isCaptured` meldet, ob
///    gerade aufgezeichnet oder auf einen anderen Bildschirm gespiegelt wird.
///    Solange das läuft, legt sich eine Abdeckung über die App.
///
/// Beides geht ausschließlich in einer installierten App. Im Browser gibt es
/// dafür keine Entsprechung — das ist der Grund für diese Hülle.
final class ScreenshotGuard {

    private weak var window: UIWindow?
    private var coverView: UIView?
    private let secureField = UITextField()

    init(window: UIWindow?) {
        self.window = window
    }

    func start() {
        protectAgainstScreenshots()
        observeScreenRecording()
        updateRecordingCover()
    }

    // MARK: - Screenshots ins Leere laufen lassen

    /// Hängt die Inhaltsebene des Fensters in die geschützte Ebene eines
    /// sicheren Textfelds um. Sichtbar bleibt alles; auf dem Screenshot nicht.
    private func protectAgainstScreenshots() {
        guard let window = window else { return }

        secureField.isSecureTextEntry = true
        secureField.isUserInteractionEnabled = false

        // Die geschützte Ebene liegt eine Stufe unter der Ebene des Textfelds.
        guard let secureLayer = secureField.layer.sublayers?.first else { return }
        secureLayer.sublayers?.forEach { $0.removeFromSuperlayer() }

        window.layer.superlayer?.addSublayer(secureLayer)
        secureLayer.addSublayer(window.layer)
        // Ohne diese Bindung bliebe die Ebene bei Drehungen an der falschen Stelle.
        secureLayer.frame = window.layer.frame
        secureLayer.position = window.layer.position
    }

    // MARK: - Bildschirmaufnahme abdecken

    private func observeScreenRecording() {
        NotificationCenter.default.addObserver(
            forName: UIScreen.capturedDidChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.updateRecordingCover()
        }
    }

    private func updateRecordingCover() {
        guard let window = window else { return }

        if UIScreen.main.isCaptured {
            guard coverView == nil else { return }
            let cover = UIView(frame: window.bounds)
            cover.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            cover.backgroundColor = UIColor { traits in
                traits.userInterfaceStyle == .dark
                    ? UIColor(red: 0.075, green: 0.075, blue: 0.082, alpha: 1)
                    : UIColor(red: 0.969, green: 0.969, blue: 0.973, alpha: 1)
            }

            let label = UILabel()
            label.text = "Bildschirmaufnahme läuft.\nDie Kursinhalte sind währenddessen ausgeblendet."
            label.numberOfLines = 0
            label.textAlignment = .center
            label.font = .systemFont(ofSize: 16, weight: .medium)
            label.textColor = UIColor { traits in
                traits.userInterfaceStyle == .dark ? .white : .black
            }
            label.translatesAutoresizingMaskIntoConstraints = false
            cover.addSubview(label)

            NSLayoutConstraint.activate([
                label.centerXAnchor.constraint(equalTo: cover.centerXAnchor),
                label.centerYAnchor.constraint(equalTo: cover.centerYAnchor),
                label.leadingAnchor.constraint(greaterThanOrEqualTo: cover.leadingAnchor, constant: 32),
                label.trailingAnchor.constraint(lessThanOrEqualTo: cover.trailingAnchor, constant: -32),
            ])

            window.addSubview(cover)
            coverView = cover
        } else {
            coverView?.removeFromSuperview()
            coverView = nil
        }
    }
}
