package de.taymaerz.foundlist.util

import java.util.Calendar

/**
 * Tiny natural-language date parser. English + German.
 * "today", "tomorrow", "next friday", "next christmas", "in 3 days", "in 2 weeks",
 * "morgen", "übermorgen", "nächsten freitag", "weihnachten", "in 3 tagen" ...
 * Returns start-of-day millis, always in the future (or today), or null.
 */
object SmartDate {

    private val weekdays = mapOf(
        "monday" to Calendar.MONDAY, "montag" to Calendar.MONDAY,
        "tuesday" to Calendar.TUESDAY, "dienstag" to Calendar.TUESDAY,
        "wednesday" to Calendar.WEDNESDAY, "mittwoch" to Calendar.WEDNESDAY,
        "thursday" to Calendar.THURSDAY, "donnerstag" to Calendar.THURSDAY,
        "friday" to Calendar.FRIDAY, "freitag" to Calendar.FRIDAY,
        "saturday" to Calendar.SATURDAY, "samstag" to Calendar.SATURDAY,
        "sunday" to Calendar.SUNDAY, "sonntag" to Calendar.SUNDAY,
    )

    // month-day holidays; fixed dates only (movable feasts are YAGNI)
    private val holidays = mapOf(
        "christmas" to (Calendar.DECEMBER to 24), "weihnachten" to (Calendar.DECEMBER to 24),
        "xmas" to (Calendar.DECEMBER to 24),
        "new year" to (Calendar.JANUARY to 1), "neujahr" to (Calendar.JANUARY to 1),
        "silvester" to (Calendar.DECEMBER to 31), "new years eve" to (Calendar.DECEMBER to 31),
        "halloween" to (Calendar.OCTOBER to 31),
        "valentine" to (Calendar.FEBRUARY to 14), "valentinstag" to (Calendar.FEBRUARY to 14),
        "nikolaus" to (Calendar.DECEMBER to 6),
        "may day" to (Calendar.MAY to 1), "1. mai" to (Calendar.MAY to 1),
    )

    private val inPattern = Regex("""^in (\d+) (day|days|tag|tagen|week|weeks|woche|wochen|month|months|monat|monaten)$""")

    // trailing time: "18:00", "6pm", "6 pm", "18 uhr", or word times
    private val timePattern = Regex("""\s+(?:at |um )?(?:(\d{1,2}):(\d{2})|(\d{1,2})\s*(pm|am|uhr))$""")
    private val wordTimes = mapOf(
        "morning" to 9, "früh" to 9, "morgens" to 9,
        "noon" to 12, "mittag" to 12, "mittags" to 12,
        "afternoon" to 15, "nachmittag" to 15, "nachmittags" to 15,
        "evening" to 19, "abend" to 19, "abends" to 19,
        "night" to 21, "nacht" to 21, "nachts" to 21, "tonight" to 21,
    )

    /** Parse with optional time: "tomorrow 18:00", "freitag abend", "next christmas 6pm". */
    fun parse(input: String, now: Calendar = Calendar.getInstance()): Long? {
        var text = input.trim().lowercase()
        var hour = -1; var minute = 0

        timePattern.find(text)?.let { m ->
            if (m.groupValues[1].isNotEmpty()) {
                hour = m.groupValues[1].toInt(); minute = m.groupValues[2].toInt()
            } else {
                hour = m.groupValues[3].toInt()
                if (m.groupValues[4] == "pm" && hour < 12) hour += 12
            }
            if (hour in 0..23) text = text.removeRange(m.range).trim() else hour = -1
        }
        if (hour < 0) {
            val last = text.substringAfterLast(' ')
            wordTimes[last]?.let { h ->
                if (text.contains(' ')) { hour = h; text = text.substringBeforeLast(' ').trim() }
            }
        }
        // bare "tonight"/"abend" = today at that time
        if (hour < 0) wordTimes[text]?.let { h -> hour = h; text = "today" }

        val day = parseDay(text, now) ?: return null
        if (hour < 0) return day
        return Calendar.getInstance().apply {
            timeInMillis = day
            set(Calendar.HOUR_OF_DAY, hour); set(Calendar.MINUTE, minute)
        }.timeInMillis
    }

    private fun parseDay(input: String, now: Calendar): Long? {
        val q = input.trim().lowercase().removePrefix("next ").removePrefix("nächsten ")
            .removePrefix("nächster ").removePrefix("nächstes ").removePrefix("am ").trim()
        if (q.isEmpty()) return null
        val base = (now.clone() as Calendar).apply {
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }

        when (q) {
            "today", "heute" -> return base.timeInMillis
            "tomorrow", "morgen" -> return base.apply { add(Calendar.DAY_OF_YEAR, 1) }.timeInMillis
            "übermorgen", "day after tomorrow" -> return base.apply { add(Calendar.DAY_OF_YEAR, 2) }.timeInMillis
            "weekend", "wochenende" -> {
                while (base.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY) base.add(Calendar.DAY_OF_YEAR, 1)
                return base.timeInMillis
            }
        }

        weekdays[q]?.let { dow ->
            base.add(Calendar.DAY_OF_YEAR, 1) // "next friday" on a friday = next week
            while (base.get(Calendar.DAY_OF_WEEK) != dow) base.add(Calendar.DAY_OF_YEAR, 1)
            return base.timeInMillis
        }

        holidays.entries.firstOrNull { q.contains(it.key) }?.let { (_, md) ->
            base.set(Calendar.MONTH, md.first)
            base.set(Calendar.DAY_OF_MONTH, md.second)
            if (base.timeInMillis < now.timeInMillis - 1000) base.add(Calendar.YEAR, 1)
            return base.timeInMillis
        }

        inPattern.find(q)?.let { m ->
            val n = m.groupValues[1].toInt()
            val unit = when (m.groupValues[2].first()) {
                'd', 't' -> Calendar.DAY_OF_YEAR
                'w' -> Calendar.WEEK_OF_YEAR
                else -> Calendar.MONTH
            }
            return base.apply { add(unit, n) }.timeInMillis
        }

        return null
    }
}
