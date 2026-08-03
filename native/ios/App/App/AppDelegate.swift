import UIKit
import Capacitor
import WebKit

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

    /// Merker: Darf dieses Gerät Screenshots machen?
    ///
    /// Die Antwort kommt von der Seite (sie kennt das Konto, die App nicht) und
    /// wird hier abgelegt, weil sie beim Start schon feststehen muss — da ist
    /// die Seite noch nicht geladen. Ohne Eintrag gilt: geschützt. Ein Fehler
    /// darf nie dazu führen, dass ein gekaufter Kurs plötzlich abfotografierbar
    /// ist.
    static let freiKey = "gf-screenshot-frei"
    static var frei: Bool { UserDefaults.standard.bool(forKey: freiKey) }

    private weak var window: UIWindow?
    private var coverView: UIView?
    private var hinweisView: UIView?
    private var hinweisTimer: Timer?
    private let secureField = UITextField()
    private var secureLayer: CALayer?

    init(window: UIWindow?) {
        self.window = window
    }

    func start() {
        // Wieder eingeschaltet (03.08.2026). Der frühere Befund „wirkungslos"
        // stammt aus dem **Simulator** — und dort greift die geschützte Ebene
        // nachweislich nicht: Ein Simulator-Screenshot ist eine Aufnahme des
        // Mac-Fensters, nicht ein iOS-Screenshot. Auf einem echten iPhone ist
        // das derselbe Weg, den WhatsApp für „einmal ansehen" benutzt.
        //
        // Falls die App danach leer oder verschoben startet: Diese eine Zeile
        // auskommentieren, neu bauen — alles andere bleibt unberührt.
        //
        // Für freigestellte Konten (Entwicklung, siehe src/lib/schutz.ts) bleibt
        // der Schutz aus. Die Entscheidung stammt aus dem vorigen Start: Beim
        // Aktivieren wird sie neu gelesen, sie wirkt also ab dem nächsten Start.
        // Umgekehrt heißt das auch: Ein Konto, das den Schutz braucht, bekommt
        // ihn spätestens beim nächsten Start zurück.
        if !Self.frei {
            protectAgainstScreenshots()
            observeScreenshots()
        }
        observeScreenRecording()
        updateRecordingCover()
    }

    /// Nach Größenänderungen (Drehen, Fenster, Tastatur) sitzen die umgehängten
    /// Ebenen sonst versetzt — sie liegen außerhalb der automatischen Anordnung.
    func refreshGeometry() {
        guard secureLayer != nil else { return }
        applyGeometry()
    }

    /// Läuft der Schutz gerade?
    var laeuft: Bool { secureLayer != nil }

    /// Schutz nachträglich einschalten.
    ///
    /// Die eine Richtung geht sofort, die andere nicht: Einschalten ist derselbe
    /// Handgriff wie beim Start und deshalb unbedenklich. Ausschalten hieße,
    /// umgehängte Ebenen im laufenden Betrieb zurückzuhängen — das braucht einen
    /// Neustart.
    ///
    /// Wichtig ist genau diese Richtung: Wer sich mit einem anderen Konto
    /// anmeldet, ist sofort geschützt, statt erst beim nächsten Start.
    func nachtraeglichSchuetzen() {
        guard !laeuft else { return }
        protectAgainstScreenshots()
        observeScreenshots()
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

    // MARK: - Screenshot: hinterher sagen, warum er leer ist

    /// In den Screenshot selbst lässt sich nichts hineinschreiben — die
    /// geschützte Ebene wird vollständig ausgelassen, Text darin also auch.
    /// Was geht: iOS meldet, DASS einer gemacht wurde. Direkt danach erscheint
    /// der Hinweis in der App. Wer es versucht, erfährt damit sofort, woran es
    /// liegt, statt einen schwarzen Screenshot für einen Fehler zu halten.
    private func observeScreenshots() {
        NotificationCenter.default.addObserver(
            forName: UIApplication.userDidTakeScreenshotNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.zeigeScreenshotHinweis()
        }
    }

    private func zeigeScreenshotHinweis() {
        guard let window = window else { return }
        hinweisTimer?.invalidate()
        hinweisView?.removeFromSuperview()

        let karte = UIView()
        karte.translatesAutoresizingMaskIntoConstraints = false
        karte.backgroundColor = UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(white: 0.13, alpha: 0.98)
                : UIColor(white: 1.0, alpha: 0.98)
        }
        karte.layer.cornerRadius = 16
        karte.layer.shadowColor = UIColor.black.cgColor
        karte.layer.shadowOpacity = 0.18
        karte.layer.shadowRadius = 24
        karte.layer.shadowOffset = CGSize(width: 0, height: 8)

        let titel = UILabel()
        titel.text = "Screenshot blockiert"
        titel.font = .systemFont(ofSize: 15, weight: .bold)
        titel.textColor = UIColor { $0.userInterfaceStyle == .dark ? .white : .black }

        let text = UILabel()
        text.text = "Die Kursinhalte gehören zu deinem Zugang und dürfen nicht weitergegeben werden. Dein Screenshot bleibt deshalb leer."
        text.numberOfLines = 0
        text.font = .systemFont(ofSize: 13.5)
        text.textColor = UIColor { $0.userInterfaceStyle == .dark
            ? UIColor(white: 1, alpha: 0.7) : UIColor(white: 0, alpha: 0.62) }

        let stapel = UIStackView(arrangedSubviews: [titel, text])
        stapel.axis = .vertical
        stapel.spacing = 5
        stapel.translatesAutoresizingMaskIntoConstraints = false
        karte.addSubview(stapel)
        window.addSubview(karte)

        NSLayoutConstraint.activate([
            stapel.topAnchor.constraint(equalTo: karte.topAnchor, constant: 14),
            stapel.bottomAnchor.constraint(equalTo: karte.bottomAnchor, constant: -14),
            stapel.leadingAnchor.constraint(equalTo: karte.leadingAnchor, constant: 16),
            stapel.trailingAnchor.constraint(equalTo: karte.trailingAnchor, constant: -16),
            karte.leadingAnchor.constraint(equalTo: window.leadingAnchor, constant: 16),
            karte.trailingAnchor.constraint(equalTo: window.trailingAnchor, constant: -16),
            karte.topAnchor.constraint(equalTo: window.safeAreaLayoutGuide.topAnchor, constant: 12),
        ])

        karte.alpha = 0
        UIView.animate(withDuration: 0.22) { karte.alpha = 1 }
        hinweisView = karte
        hinweisTimer = Timer.scheduledTimer(withTimeInterval: 4.5, repeats: false) { [weak self] _ in
            guard let karte = self?.hinweisView else { return }
            UIView.animate(withDuration: 0.22, animations: { karte.alpha = 0 }) { _ in
                karte.removeFromSuperview()
            }
            self?.hinweisView = nil
        }
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
            label.text = """
            Bildschirmaufnahme läuft

            Die Kursinhalte gehören zu deinem Zugang und dürfen nicht \
            weitergegeben werden. Sie sind währenddessen ausgeblendet.

            Beende die Aufnahme, um weiterzulernen.
            """
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
        tastaturBeobachten()

        // Nach dem Aufbau: Die Webansicht steht erst im nächsten Durchlauf.
        DispatchQueue.main.async { [weak self] in self?.scrollverhalten() }
        // Und noch zweimal später: Beim Start ist die Seite noch nicht geladen,
        // die Antwort auf „darf dieses Konto Screenshots machen?" gibt es also
        // erst nach ein paar Sekunden. Ohne das müsste man die App eigens in den
        // Hintergrund und wieder nach vorne holen, damit sie ankommt.
        for verzoegerung in [4.0, 10.0] {
            DispatchQueue.main.asyncAfter(deadline: .now() + verzoegerung) { [weak self] in
                self?.scrollverhalten()
            }
        }
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        scrollverhalten()
    }

    /// Nach dem Tippen aufräumen.
    ///
    /// iOS zoomt beim Antippen eines Feldes hinein und bleibt danach so stehen —
    /// die Seite ist dann breiter als der Bildschirm. Die Ursache ist behoben
    /// (Felder sind in der App 16px groß, siehe globals.css); das hier ist der
    /// Gürtel zum Hosenträger: Sobald die Tastatur weg ist, steht die Ansicht
    /// wieder gerade, statt eine Minute lang schief zu bleiben.
    private func tastaturBeobachten() {
        NotificationCenter.default.addObserver(
            forName: UIResponder.keyboardDidHideNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.scrollverhalten()
        }
    }

    /// Scrollen wie in einer App, nicht wie auf einer Seite.
    ///
    /// Zwei Dinge, die WKWebView von sich aus nicht so macht:
    ///
    /// 1. **Immer federn.** Ohne `alwaysBounceVertical` federt die Ansicht nur,
    ///    wenn der Inhalt länger als der Bildschirm ist. Auf kurzen Seiten
    ///    („Themen") passiert beim Wischen deshalb gar nichts — es fühlt sich
    ///    an, als wäre die App eingefroren. WhatsApp federt auf jeder Liste,
    ///    auch auf einer leeren.
    /// 2. **Nie seitlich schieben.** Läuft der Inhalt einmal über die Breite
    ///    hinaus, bleibt die Seite sonst dauerhaft verschoben stehen.
    private func scrollverhalten() {
        screenshotGuard?.refreshGeometry()
        guard let window = window, let web = Self.webansicht(in: window) else { return }
        schutzAntwortLesen(web)
        let sicht = web.scrollView
        sicht.bounces = true
        sicht.alwaysBounceVertical = true
        sicht.alwaysBounceHorizontal = false
        sicht.contentInsetAdjustmentBehavior = .never
        // Die Fläche, die beim Überziehen sichtbar wird, gehört der Webansicht,
        // nicht der Seite. Stand sie fest (hell aus der Konfiguration), blitzte
        // im dunklen Erscheinungsbild ein weißer Streifen auf. `nil` heißt:
        // WebKit nimmt die Hintergrundfarbe der Seite — und die kennt hell und
        // dunkel.
        web.underPageBackgroundColor = nil
        web.isOpaque = true
        sicht.backgroundColor = nil
        // Ein hineingezoomter Zustand überlebt sonst jeden Seitenwechsel und
        // schneidet den rechten Rand ab.
        if sicht.zoomScale != 1 {
            sicht.setZoomScale(1, animated: false)
        }
        if sicht.contentOffset.x != 0 {
            sicht.setContentOffset(CGPoint(x: 0, y: sicht.contentOffset.y), animated: false)
        }
    }

    /// Holt die Antwort auf „darf dieses Konto Screenshots machen?" von der
    /// Seite und merkt sie sich für den nächsten Start.
    ///
    /// Nur eine Richtung wirkt sofort: Sagt die Antwort „geschützt", wird der
    /// Schutz auf der Stelle eingeschaltet. Sagt sie „frei", wird das nur
    /// vermerkt und gilt ab dem nächsten Start — umgehängte Ebenen im laufenden
    /// Betrieb zurückzuhängen ist ein Eingriff, der schiefgehen kann.
    ///
    /// Die Reihenfolge ist Absicht: Ein Kontowechsel darf nie eine Sitzung lang
    /// ungeschützt bleiben; ein Neustart zum Screenshot-Machen ist zumutbar.
    private func schutzAntwortLesen(_ web: WKWebView) {
        web.evaluateJavaScript("localStorage.getItem('\(ScreenshotGuard.freiKey)')") { [weak self] wert, _ in
            guard let text = wert as? String else { return }
            let frei = text == "1"
            UserDefaults.standard.set(frei, forKey: ScreenshotGuard.freiKey)
            // Sagt die Antwort „geschützt", gilt das sofort — nicht erst beim
            // nächsten Start. Sonst bliebe der Schutz nach einem Kontowechsel
            // eine ganze Sitzung lang aus.
            if !frei { self?.screenshotGuard?.nachtraeglichSchuetzen() }
        }
    }

    private static func webansicht(in view: UIView) -> WKWebView? {
        if let web = view as? WKWebView { return web }
        for unter in view.subviews {
            if let treffer = webansicht(in: unter) { return treffer }
        }
        return nil
    }
}
