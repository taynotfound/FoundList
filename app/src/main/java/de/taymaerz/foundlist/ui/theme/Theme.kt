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
import de.taymaerz.foundlist.util.Prefs

/** Color presets. Calm, low saturation - seed + containers per palette. */
private fun preset(seedLight: Color, containerLight: Color, seedDark: Color, containerDark: Color) = Pair(
    lightColorScheme(primary = seedLight, primaryContainer = containerLight),
    darkColorScheme(primary = seedDark, primaryContainer = containerDark),
)

private val Teal = preset(Color(0xFF00696D), Color(0xFF6FF6FC), Color(0xFF4DD9E0), Color(0xFF004F52))
private val Lavender = preset(Color(0xFF66558E), Color(0xFFEADDFF), Color(0xFFCFBDFE), Color(0xFF4E3D74))
private val Forest = preset(Color(0xFF3B6939), Color(0xFFBCF0B4), Color(0xFFA1D399), Color(0xFF235024))
private val Sunset = preset(Color(0xFF8F4A4E), Color(0xFFFFDADA), Color(0xFFFFB3B5), Color(0xFF733337))
private val Mono = preset(Color(0xFF5D5F5F), Color(0xFFE2E2E2), Color(0xFFC6C6C6), Color(0xFF454747))

@Composable
fun FoundListTheme(content: @Composable () -> Unit) {
    val dark = when (Prefs.themeMode.value) {
        Prefs.ThemeMode.SYSTEM -> isSystemInDarkTheme()
        Prefs.ThemeMode.LIGHT -> false
        Prefs.ThemeMode.DARK -> true
    }
    val context = LocalContext.current
    val colors = when (Prefs.palette.value) {
        Prefs.Palette.DYNAMIC ->
            if (Build.VERSION.SDK_INT >= 31)
                if (dark) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
            else if (dark) Teal.second else Teal.first
        Prefs.Palette.TEAL -> if (dark) Teal.second else Teal.first
        Prefs.Palette.LAVENDER -> if (dark) Lavender.second else Lavender.first
        Prefs.Palette.FOREST -> if (dark) Forest.second else Forest.first
        Prefs.Palette.SUNSET -> if (dark) Sunset.second else Sunset.first
        Prefs.Palette.MONO -> if (dark) Mono.second else Mono.first
    }
    MaterialTheme(
        colorScheme = colors,
        typography = if (Prefs.handwritingFont.value) HandTypography else androidx.compose.material3.Typography(),
        content = content,
    )
}

/** Patrick Hand everywhere when the artsy switch is on. */
private val Hand = androidx.compose.ui.text.font.FontFamily(
    androidx.compose.ui.text.font.Font(de.taymaerz.foundlist.R.font.patrick_hand),
)

private val HandTypography = androidx.compose.material3.Typography().let { t ->
    androidx.compose.material3.Typography(
        displayLarge = t.displayLarge.copy(fontFamily = Hand),
        displayMedium = t.displayMedium.copy(fontFamily = Hand),
        displaySmall = t.displaySmall.copy(fontFamily = Hand),
        headlineLarge = t.headlineLarge.copy(fontFamily = Hand),
        headlineMedium = t.headlineMedium.copy(fontFamily = Hand),
        headlineSmall = t.headlineSmall.copy(fontFamily = Hand),
        titleLarge = t.titleLarge.copy(fontFamily = Hand),
        titleMedium = t.titleMedium.copy(fontFamily = Hand),
        titleSmall = t.titleSmall.copy(fontFamily = Hand),
        bodyLarge = t.bodyLarge.copy(fontFamily = Hand, fontSize = t.bodyLarge.fontSize * 1.05),
        bodyMedium = t.bodyMedium.copy(fontFamily = Hand, fontSize = t.bodyMedium.fontSize * 1.05),
        bodySmall = t.bodySmall.copy(fontFamily = Hand),
        labelLarge = t.labelLarge.copy(fontFamily = Hand),
        labelMedium = t.labelMedium.copy(fontFamily = Hand),
        labelSmall = t.labelSmall.copy(fontFamily = Hand),
    )
}
