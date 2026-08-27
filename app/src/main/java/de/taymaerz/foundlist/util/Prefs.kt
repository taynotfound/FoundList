package de.taymaerz.foundlist.util

import android.content.Context
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf

/** App preferences. SharedPreferences + Compose state, nothing fancier needed. */
object Prefs {
    enum class ThemeMode { SYSTEM, LIGHT, DARK }
    enum class Gamification { OFF, GENTLE, XP, HP_BAR, GARDEN }
    enum class Palette { DYNAMIC, TEAL, LAVENDER, FOREST, SUNSET, MONO }

    lateinit var themeMode: MutableState<ThemeMode>
    lateinit var palette: MutableState<Palette>
    lateinit var gamification: MutableState<Gamification>

    fun init(context: Context) {
        val sp = context.getSharedPreferences("prefs", Context.MODE_PRIVATE)
        themeMode = mutableStateOf(ThemeMode.valueOf(sp.getString("theme", "SYSTEM")!!))
        palette = mutableStateOf(Palette.valueOf(sp.getString("palette", "DYNAMIC")!!))
        gamification = mutableStateOf(Gamification.valueOf(sp.getString("gamification", "GENTLE")!!))
    }

    fun save(context: Context) {
        context.getSharedPreferences("prefs", Context.MODE_PRIVATE).edit()
            .putString("theme", themeMode.value.name)
            .putString("palette", palette.value.name)
            .putString("gamification", gamification.value.name)
            .apply()
    }
}
