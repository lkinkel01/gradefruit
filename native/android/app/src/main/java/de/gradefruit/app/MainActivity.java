package de.gradefruit.app;

import android.os.Bundle;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

/**
 * Screenshot-Sperre für Android.
 *
 * FLAG_SECURE ist genau das, was WhatsApp im Chat-Bildschirm setzt: Das
 * Betriebssystem weist den Screenshot ab ("Screenshot nicht möglich"),
 * Bildschirmaufnahmen bleiben schwarz, und das Fenster erscheint auch in der
 * App-Übersicht nicht mehr als Vorschaubild.
 *
 * Das kann nur eine installierte App — im Browser gibt es dafür keine
 * Entsprechung. Deshalb existiert diese Hülle überhaupt.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }
}
