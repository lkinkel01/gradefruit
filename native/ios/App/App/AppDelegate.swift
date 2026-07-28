import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

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
    }

    // Ab iOS 26 startet eine App ausschließlich über Szenen; den alten Weg über
    // das AppDelegate-Fenster gibt es nicht mehr. Capacitors Vorlage benutzt
    // noch den alten Weg — deshalb blieb der Bildschirm komplett leer, auch bei
    // rein nativem Inhalt. Diese Angabe verbindet die App mit dem SceneDelegate.
    func application(_ application: UIApplication, configurationForConnecting session: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration", sessionRole: session.role)
        config.delegateClass = SceneDelegate.self
        return config
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
    private var secureLayer: CALayer?

    init(window: UIWindow?) {
        self.window = window
    }

    func start() {
        // ABGESCHALTET — nachgewiesen wirkungslos: Der Simulator-Bildschirm und
        // der iOS-Screenshot zeigen beide denselben Inhalt. Die weißen
        // Screenshots der vorigen Versuche waren kein Schutz, sondern eine noch
        // nicht fertig gezeichnete Seite.
        // protectAgainstScreenshots()
        observeScreenRecording()
        updateRecordingCover()
    }

    // MARK: - Screenshots ins Leere laufen lassen

    /// Hängt die Inhaltsebene in die geschützte Ebene eines sicheren
    /// Textfelds um. Auf dem Bildschirm bleibt alles sichtbar, auf einem
    /// Screenshot lässt iOS diese Ebene grundsätzlich aus. Denselben Weg geht
    /// WhatsApp bei „einmal ansehen".
    ///
    /// Zwei Fallstricke, an denen die vorigen Versuche gescheitert sind:
    /// 1. Das Feld muss in der Anzeige hängen, sonst gibt es die geschützte
    ///    Ebene gar nicht.
    /// 2. Erst die GANZE Feldebene heraufheben, dann die Inhaltsebene darunter
    ///    hängen — andersherum entsteht ein Kreis und die App stürzt ab.
    /// 3. Nach dem Umhängen greift keine automatische Anordnung mehr; ohne
    ///    ausdrücklich gesetzte Maße saß der Inhalt verschoben.
    private func protectAgainstScreenshots() {
        guard let window = window else { return }

        secureField.isSecureTextEntry = true
        secureField.isUserInteractionEnabled = false
        window.addSubview(secureField)
        window.layoutIfNeeded()

        window.layer.superlayer?.addSublayer(secureField.layer)
        guard let secureLayer = secureField.layer.sublayers?.last else { return }
        secureLayer.addSublayer(window.layer)

        self.secureLayer = secureLayer
        applyGeometry()

    }

    /// Die umgehängten Ebenen liegen außerhalb der automatischen Anordnung und
    /// brauchen ihre Maße ausdrücklich — sonst sitzt der Inhalt versetzt.
    private func applyGeometry() {
        guard let window = window else { return }
        let bounds = window.bounds
        secureField.frame = bounds
        secureField.layer.frame = bounds
        secureLayer?.frame = bounds
        window.layer.frame = bounds
        window.layer.position = CGPoint(x: bounds.midX, y: bounds.midY)
        window.layer.anchorPoint = CGPoint(x: 0.5, y: 0.5)
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


/// Aufbau des Fensters für iOS 26 und neuer.
///
/// Hier entsteht das Fenster, hier hängt der Screenshot-Schutz — und zwar
/// bevor irgendein Kursinhalt sichtbar wird.
final class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?
    private var screenshotGuard: ScreenshotGuard?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        let newWindow = UIWindow(windowScene: windowScene)
        newWindow.rootViewController = UIStoryboard(name: "Main", bundle: nil).instantiateInitialViewController()
        newWindow.makeKeyAndVisible()
        window = newWindow

        let guardInstance = ScreenshotGuard(window: newWindow)
        guardInstance.start()
        screenshotGuard = guardInstance
    }
}
