package de.taymaerz.foundlist

import de.taymaerz.foundlist.util.SmartDate
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.util.Calendar

class SmartDateTest {
    // fixed "now": Wed 2026-08-26
    private val now: Calendar = Calendar.getInstance().apply {
        set(2026, Calendar.AUGUST, 26, 15, 30, 0); set(Calendar.MILLISECOND, 0)
    }

    private fun day(y: Int, m: Int, d: Int): Long = Calendar.getInstance().apply {
        set(y, m, d, 0, 0, 0); set(Calendar.MILLISECOND, 0)
    }.timeInMillis

    @Test fun tomorrow() = assertEquals(day(2026, Calendar.AUGUST, 27), SmartDate.parse("tomorrow", now))
    @Test fun morgenGerman() = assertEquals(day(2026, Calendar.AUGUST, 27), SmartDate.parse("Morgen", now))
    @Test fun nextFriday() = assertEquals(day(2026, Calendar.AUGUST, 28), SmartDate.parse("next friday", now))
    @Test fun nextChristmas() = assertEquals(day(2026, Calendar.DECEMBER, 24), SmartDate.parse("next christmas", now))
    @Test fun weihnachten() = assertEquals(day(2026, Calendar.DECEMBER, 24), SmartDate.parse("Weihnachten", now))
    @Test fun inThreeDays() = assertEquals(day(2026, Calendar.AUGUST, 29), SmartDate.parse("in 3 days", now))
    @Test fun inTwoWeeks() = assertEquals(day(2026, Calendar.SEPTEMBER, 9), SmartDate.parse("in 2 weeks", now))
    @Test fun garbage() = assertNull(SmartDate.parse("blorbo", now))
}
