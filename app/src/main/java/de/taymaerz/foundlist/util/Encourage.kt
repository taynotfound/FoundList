package de.taymaerz.foundlist.util

/** Varied, gentle copy for notifications and completion moments. No guilt, no streak-shaming. */
object Encourage {

    private val reminderTemplates = listOf(
        "\"%s\" is waiting for you ✨",
        "Gentle nudge: %s",
        "When you're ready: %s",
        "Hey~ don't forget: %s",
        "One small step: %s",
        "You've got this: %s",
        "Reminder, no pressure: %s",
        "Future you says thanks: %s",
    )

    private val completionToasts = listOf(
        "Nice, one down!",
        "Done and dusted ✨",
        "That's off your plate.",
        "Look at you go~",
        "One less thing to carry.",
        "Small win, real win.",
        "Checked off. Breathe.",
    )

    fun reminder(title: String): String = reminderTemplates.random().format(title)

    fun completion(): String = completionToasts.random()

    /** Milestone line for N tasks completed all-time, or null when nothing special. */
    fun milestone(total: Int): String? = when (total) {
        1 -> "First task ever completed 🎉"
        10 -> "10 tasks done all-time!"
        25 -> "25 tasks! Quietly unstoppable."
        50 -> "50 tasks done. Half a hundred!"
        100 -> "100 tasks!! Legend behavior."
        else -> if (total > 0 && total % 100 == 0) "$total tasks done all-time 🎉" else null
    }
}
