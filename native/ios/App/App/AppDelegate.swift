import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var screenshotGuard: ScreenshotGuard?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Schutz beim ersten Aktivwerden einhängen — hier steht das Fenster
        // sicher bereit, anders als beim Start. Die Klasse steht unten in dieser Datei.
        if screenshotGuard == nil, let window = window {
            let guardInstance = ScreenshotGuard(window: window)
            guardInstance.start()
            screenshotGuard = guardInstance
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

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
