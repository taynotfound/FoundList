package de.taymaerz.foundlist.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

// Static fallback for Android 10/11 (no dynamic color) — calm teal, low saturation
private val LightColors = lightColorScheme(
    primary = Color(0xFF00696D),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFF6FF6FC),
    onPrimaryContainer = Color(0xFF002021),
    secondary = Color(0xFF4A6365),
    surface = Color(0xFFFAFDFC),
    background = Color(0xFFFAFDFC),
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF4DD9E0),
    onPrimary = Color(0xFF003738),
    primaryContainer = Color(0xFF004F52),
    onPrimaryContainer = Color(0xFF6FF6FC),
    secondary = Color(0xFFB1CBCD),
    surface = Color(0xFF191C1C),
    background = Color(0xFF191C1C),
)

@Composable
fun FoundListTheme(content: @Composable () -> Unit) {
    val dark = isSystemInDarkTheme()
    val context = LocalContext.current
    val colors = when {
        Build.VERSION.SDK_INT >= 31 ->
            if (dark) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        dark -> DarkColors
        else -> LightColors
    }
    MaterialTheme(colorScheme = colors, content = content)
}
