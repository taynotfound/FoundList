package de.taymaerz.foundlist.util

import kotlin.math.min
import kotlin.math.sqrt

/** Choose-your-own gamification math. Pure functions, no storage of its own. */
object Game {
    /** XP: priorities weight completions. */
    fun xp(completedLow: Int, completedMed: Int, completedHigh: Int): Int =
        completedLow * 5 + completedMed * 10 + completedHigh * 20

    /** Level from XP: gentle sqrt curve, level 1 at 0 XP. */
    fun level(xp: Int): Int = 1 + sqrt(xp / 50.0).toInt()

    fun xpForLevel(level: Int): Int = ((level - 1) * (level - 1) * 50)

    /** Progress 0..1 within the current level. */
    fun levelProgress(xp: Int): Float {
        val l = level(xp)
        val cur = xpForLevel(l)
        val next = xpForLevel(l + 1)
        return ((xp - cur).toFloat() / (next - cur)).coerceIn(0f, 1f)
    }

    /**
     * HP: start at 100, each overdue task bites, each task done today heals.
     * Never below 10 - the bar nags, it never kills you.
     */
    fun hp(overdue: Int, doneToday: Int): Int =
        (100 - overdue * 15 + doneToday * 5).coerceIn(10, 100)

    /** Garden: one plant per completed task, capped row. Grows forever, never dies. */
    fun garden(totalCompleted: Int): String {
        if (totalCompleted == 0) return "🌱 plant your first task"
        val plants = listOf("🌱", "🌿", "🌷", "🌻", "🌳")
        val full = min(totalCompleted / 5, 7)
        val stage = plants[min(totalCompleted % 25 / 5, plants.size - 1)]
        return plants.last().repeat(full) + stage
    }
}
