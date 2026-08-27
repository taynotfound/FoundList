package de.taymaerz.foundlist.ui.theme

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathFillType
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.path
import androidx.compose.ui.unit.dp

/**
 * Hand-drawn doodle icon set, same wobbly-ink style as the app logo.
 * All 24x24, stroke-based, currentColor via tint.
 */
object DoodleIcons {

    private fun doodle(name: String, builder: androidx.compose.ui.graphics.vector.ImageVector.Builder.() -> Unit): ImageVector =
        ImageVector.Builder(
            name = name, defaultWidth = 24.dp, defaultHeight = 24.dp,
            viewportWidth = 24f, viewportHeight = 24f,
        ).apply(builder).build()

    private fun ImageVector.Builder.stroke(width: Float = 1.8f, data: String) {
        addPath(
            pathData = androidx.compose.ui.graphics.vector.addPathNodes(data),
            stroke = SolidColor(Color.Black), strokeLineWidth = width,
            strokeLineCap = StrokeCap.Round, strokeLineJoin = StrokeJoin.Round,
            fill = null, pathFillType = PathFillType.NonZero,
        )
    }

    /** wobbly checkbox with overshooting tick (list/today) */
    val List: ImageVector by lazy {
        doodle("DoodleList") {
            stroke(1.8f, "M5.2,4.4 Q4.8,7.2 5.1,7.7 Q7.8,8 8.2,7.6 Q8.5,4.9 8.1,4.5 Q5.6,4.2 5.2,4.4 Z")
            stroke(1.8f, "M5.5,6 L6.6,7.4 Q8,5 9.6,3.8")
            stroke(2f, "M11.5,6 Q15,5.7 18.8,6")
            stroke(1.8f, "M5.3,11.4 Q4.9,14.2 5.2,14.7 Q7.9,15 8.3,14.6 Q8.6,11.9 8.2,11.5 Q5.7,11.2 5.3,11.4 Z")
            stroke(1.8f, "M5.6,13 L6.7,14.4 Q8.1,12 9.7,10.8")
            stroke(2f, "M11.6,13 Q15.1,12.7 18.9,13")
            stroke(1.8f, "M5.4,18.4 Q5,21.2 5.3,21.7 Q8,22 8.4,21.6 Q8.7,18.9 8.3,18.5 Q5.8,18.2 5.4,18.4 Z")
            stroke(2f, "M11.7,20 Q15.2,19.7 19,20")
        }
    }

    /** wobbly clock (history) */
    val History: ImageVector by lazy {
        doodle("DoodleHistory") {
            stroke(1.8f, "M12,3.6 Q17.5,3.2 20.2,8 Q22.4,12.6 19.4,17 Q16.2,21.2 11.2,20.4 Q6.4,19.6 4.4,15.2 Q2.6,10.6 5.6,6.8 Q8.2,3.9 12,3.6 Z")
            stroke(1.8f, "M12,7.5 Q11.8,10.2 12.1,12.3 Q13.9,13.5 15.6,14.2")
        }
    }

    /** wobbly gear (settings) */
    val Settings: ImageVector by lazy {
        doodle("DoodleSettings") {
            stroke(1.8f, "M12,8.6 Q14.4,8.4 15.3,10.4 Q16.1,12.4 14.6,14 Q13,15.5 11,14.7 Q9.1,13.8 9.2,11.8 Q9.4,9 12,8.6 Z")
            stroke(1.6f, "M12,3.5 L12,6.2 M12,17.8 L12,20.5 M3.8,12 L6.5,12 M17.5,12 L20.2,12 M6.2,6.2 L8.1,8.1 M15.9,15.9 L17.8,17.8 M17.8,6.2 L15.9,8.1 M8.1,15.9 L6.2,17.8")
        }
    }

    /** plus (add) */
    val Add: ImageVector by lazy {
        doodle("DoodleAdd") {
            stroke(2.2f, "M12,4.5 Q11.7,12 12.1,19.5")
            stroke(2.2f, "M4.5,12 Q12,11.7 19.5,12.1")
        }
    }

    /** wobbly trash can (delete) */
    val Delete: ImageVector by lazy {
        doodle("DoodleDelete") {
            stroke(1.8f, "M6,7 Q6.5,14 6.9,19 Q7,20.3 8.3,20.3 Q12,20.6 15.7,20.3 Q17,20.3 17.1,19 Q17.5,14 18,7")
            stroke(1.8f, "M4.2,6.6 Q12,6 19.8,6.6")
            stroke(1.8f, "M9.4,6.2 Q9.4,4.4 10.4,4.1 Q12,3.8 13.6,4.1 Q14.6,4.4 14.6,6.2")
            stroke(1.6f, "M9.9,9.5 Q10,13.5 10.2,17 M14.1,9.5 Q14,13.5 13.8,17")
        }
    }

    /** wobbly bell (notifications) */
    val Bell: ImageVector by lazy {
        doodle("DoodleBell") {
            stroke(1.8f, "M12,4 Q16.4,4.2 17.2,8.4 Q17.7,11.4 18.4,13.6 Q19,15.4 20,16.4 Q13,17.6 4,16.4 Q5,15.4 5.6,13.6 Q6.3,11.4 6.8,8.4 Q7.6,4.2 12,4 Z")
            stroke(1.8f, "M10,19 Q11,20.6 12,20.6 Q13,20.6 14,19")
        }
    }

    /** broom (clear completed) */
    val Sweep: ImageVector by lazy {
        doodle("DoodleSweep") {
            stroke(1.9f, "M17.5,4 Q13.8,8.2 11.2,11.5")
            stroke(1.8f, "M11.2,11.5 Q8,12.6 6.4,15.2 Q5,17.6 4.6,19.8 Q7.4,20 10.2,19 Q13.2,17.8 13.8,14.2 Q12.6,12.4 11.2,11.5 Z")
            stroke(1.4f, "M7.5,15.5 Q7.2,17.5 6.6,19 M10.3,14.6 Q10.2,16.8 9.6,18.8")
        }
    }

    /** code brackets (source) */
    val Code: ImageVector by lazy {
        doodle("DoodleCode") {
            stroke(1.9f, "M8.5,6.5 Q5.5,9.2 4.2,12 Q5.5,14.8 8.5,17.5")
            stroke(1.9f, "M15.5,6.5 Q18.5,9.2 19.8,12 Q18.5,14.8 15.5,17.5")
        }
    }

    /** heart (hp/gamification) */
    val Heart: ImageVector by lazy {
        doodle("DoodleHeart") {
            stroke(1.9f, "M12,20 Q6,15.5 4.4,11.6 Q3,7.8 6,5.8 Q9,4 12,7.4 Q15,4 18,5.8 Q21,7.8 19.6,11.6 Q18,15.5 12,20 Z")
        }
    }

    /** sparkle (encourage/milestone) */
    val Sparkle: ImageVector by lazy {
        doodle("DoodleSparkle") {
            stroke(1.9f, "M12,4 Q12.6,9 13.4,10.6 Q15,11.4 20,12 Q15,12.6 13.4,13.4 Q12.6,15 12,20 Q11.4,15 10.6,13.4 Q9,12.6 4,12 Q9,11.4 10.6,10.6 Q11.4,9 12,4 Z")
        }
    }

    /** lightning (energy tag) */
    val Energy: ImageVector by lazy {
        doodle("DoodleEnergy") {
            stroke(1.9f, "M13.5,3.5 Q9.5,9 7.5,13 L11.5,13 Q10.5,17 10,20.5 Q14.5,15 16.5,11 L12.5,11 Q13,7 13.5,3.5 Z")
        }
    }

    /** calendar page (due) */
    val Calendar: ImageVector by lazy {
        doodle("DoodleCalendar") {
            stroke(1.8f, "M5,6.5 Q12,5.9 19,6.5 Q19.6,13 19,19 Q12,19.6 5,19 Q4.4,13 5,6.5 Z")
            stroke(1.8f, "M5,10.4 Q12,9.9 19,10.4")
            stroke(1.8f, "M8.5,4.4 L8.5,7.4 M15.5,4.4 L15.5,7.4")
        }
    }

    /** clock face (time picker) */
    val Clock: ImageVector by lazy {
        doodle("DoodleClock") {
            stroke(1.8f, "M12,4.2 Q16.8,4 19,8.2 Q20.8,12.2 18.4,15.8 Q15.8,19.6 11.4,19 Q7.2,18.4 5.4,14.6 Q3.8,10.6 6.4,7.2 Q8.6,4.4 12,4.2 Z")
            stroke(1.8f, "M12,8 L12,12.2 L15,14")
        }
    }

    /** repeat arrows (recurrence) */
    val Repeat: ImageVector by lazy {
        doodle("DoodleRepeat") {
            stroke(1.8f, "M6,9.5 Q6.4,6.7 9,6.5 Q13,6.2 17,6.5 M17,6.5 L15,4.5 M17,6.5 L15,8.5")
            stroke(1.8f, "M18,14.5 Q17.6,17.3 15,17.5 Q11,17.8 7,17.5 M7,17.5 L9,15.5 M7,17.5 L9,19.5")
        }
    }

    /** flower (garden mode) */
    val Flower: ImageVector by lazy {
        doodle("DoodleFlower") {
            stroke(1.7f, "M12,10 Q10.4,6.4 12,4.6 Q13.6,6.4 12,10 Z M12,10 Q15.6,8.4 17.4,10 Q15.6,11.6 12,10 Z M12,10 Q13.6,13.6 12,15.4 Q10.4,13.6 12,10 Z M12,10 Q8.4,11.6 6.6,10 Q8.4,8.4 12,10 Z")
            stroke(1.8f, "M12,15 Q11.8,18 12,20.5")
        }
    }

    /** timer (focus) */
    val Timer: ImageVector by lazy {
        doodle("DoodleTimer") {
            stroke(1.8f, "M12,6.2 Q16.4,6 18.4,9.8 Q20.2,13.6 17.8,17 Q15.2,20.4 11.2,19.6 Q7.4,18.8 6,15.2 Q4.8,11.4 7.4,8.4 Q9.4,6.3 12,6.2 Z")
            stroke(1.8f, "M12,9.5 L12,13 L14.4,14.4")
            stroke(1.9f, "M10,3.6 Q12,3.2 14,3.6")
        }
    }

    /** bar chart (stats) */
    val Stats: ImageVector by lazy {
        doodle("DoodleStats") {
            stroke(1.9f, "M5.5,19.5 Q5.4,16 5.7,13.4 M10.5,19.5 Q10.3,12 10.7,7 M15.5,19.5 Q15.4,14.5 15.7,10.5 M20,20 Q12,20.4 4,20")
        }
    }

    /** arrow back */
    val Back: ImageVector by lazy {
        doodle("DoodleBack") {
            stroke(2f, "M19,12 Q12,11.7 5.5,12.1 M5.5,12.1 L10.5,7 M5.5,12.1 L10.5,17")
        }
    }

    /** floppy-ish save */
    val Save: ImageVector by lazy {
        doodle("DoodleSave") {
            stroke(1.8f, "M6,4.6 Q11,4.2 15.6,4.5 L19.4,8.3 Q19.8,13.6 19.4,19 Q12,19.6 4.8,19 Q4.3,12 4.7,5.6 Q4.8,4.7 6,4.6 Z")
            stroke(1.6f, "M8,4.8 Q7.9,7.4 8.2,8.6 Q11.6,8.9 14.8,8.6 Q15,7 14.9,4.9")
            stroke(1.6f, "M7.6,13 Q7.5,16.4 7.8,18.8 M7.7,13.2 Q12,12.8 16.3,13.1 Q16.5,16 16.3,18.9")
        }
    }

    /** share arrow */
    val Share: ImageVector by lazy {
        doodle("DoodleShare") {
            stroke(1.8f, "M15.5,5.5 Q9,9 8,12 Q9,15 15.5,18.5")
            stroke(1.7f, "M18,4 Q16.6,4.9 16.4,6.4 Q17.6,7.5 19,7 Q19.8,5.4 18,4 Z M18,17 Q16.6,17.9 16.4,19.4 Q17.6,20.5 19,20 Q19.8,18.4 18,17 Z M6,10.4 Q4.6,11.3 4.4,12.8 Q5.6,13.9 7,13.4 Q7.8,11.8 6,10.4 Z")
        }
    }

    /** download/import arrow into tray */
    val Import: ImageVector by lazy {
        doodle("DoodleImport") {
            stroke(1.9f, "M12,4 Q11.8,9.5 12.1,14 M12.1,14 L8.5,10.8 M12.1,14 L15.5,10.8")
            stroke(1.8f, "M4.5,16.5 Q4.6,19.5 6,19.7 Q12,20.2 18,19.7 Q19.4,19.5 19.5,16.5")
        }
    }
}
