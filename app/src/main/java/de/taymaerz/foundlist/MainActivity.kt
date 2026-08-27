package de.taymaerz.foundlist

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import de.taymaerz.foundlist.ui.FoundListApp as AppRoot
import de.taymaerz.foundlist.ui.theme.FoundListTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FoundListTheme {
                AppRoot(startNewTask = intent?.action == "de.taymaerz.foundlist.NEW_TASK")
            }
        }
    }
}
