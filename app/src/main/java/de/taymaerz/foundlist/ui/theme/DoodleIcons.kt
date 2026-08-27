package de.taymaerz.foundlist.ui.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathFillType
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.addPathNodes
import androidx.compose.ui.unit.dp

/**
 * Hand-drawn doodle icons. Rules of the sketchbook:
 * - nothing is straight, every line bows or wobbles
 * - key strokes get a second lighter "pencil pass" slightly offset
 * - ticks overshoot, boxes sag, circles are lumpy
 */
object DoodleIcons {

    private fun icon(name: String, builder: ImageVector.Builder.() -> Unit): ImageVector =
        ImageVector.Builder(
            name = name, defaultWidth = 24.dp, defaultHeight = 24.dp,
            viewportWidth = 24f, viewportHeight = 24f,
        ).apply(builder).build()

    /** main ink stroke */
    private fun ImageVector.Builder.ink(width: Float = 2.1f, data: String) {
        addPath(
            pathData = addPathNodes(data),
            stroke = SolidColor(Color.Black), strokeLineWidth = width,
            strokeLineCap = StrokeCap.Round, strokeLineJoin = StrokeJoin.Round,
            fill = null, pathFillType = PathFillType.NonZero,
        )
    }

    /** faint second pencil pass - the "went over it again" effect */
    private fun ImageVector.Builder.ghost(data: String) {
        addPath(
            pathData = addPathNodes(data),
            stroke = SolidColor(Color.Black.copy(alpha = 0.35f)), strokeLineWidth = 1.1f,
            strokeLineCap = StrokeCap.Round, strokeLineJoin = StrokeJoin.Round,
            fill = null, pathFillType = PathFillType.NonZero,
        )
    }

    /** saggy checkbox, tick shoots way past the corner */
    val List: ImageVector by lazy {
        icon("DoodleList") {
            ink(data = "M5.6,6.2 C4.9,9.4 5.0,14.2 5.7,17.9 C9.1,18.7 13.9,18.5 17.6,17.8 C18.4,14.3 18.2,9.6 17.7,6.0 C14.1,5.3 8.9,5.5 5.6,6.2 Z")
            ghost("M5.9,6.6 C5.3,9.6 5.4,14.0 6.0,17.5")
            ink(2.4f, "M7.4,11.6 C9.1,13.2 10.2,14.7 11.0,16.1 C13.0,12.0 16.4,7.0 21.6,2.6")
            ghost("M8.0,12.2 C9.4,13.6 10.3,14.8 11.0,15.8")
        }
    }

    /** lumpy clock, hands not quite meeting the center */
    val History: ImageVector by lazy {
        icon("DoodleHistory") {
            ink(data = "M12.4,4.2 C7.6,3.8 4.3,7.6 4.5,12.1 C4.7,16.7 8.2,20.1 12.3,19.9 C16.7,19.7 19.8,16.2 19.6,11.7 C19.4,7.4 16.5,4.5 12.4,4.2 Z")
            ghost("M12.2,4.7 C8.1,4.4 5.0,7.9 5.1,12.0")
            ink(2.0f, "M12.1,7.8 C12.0,9.6 11.9,11.2 12.2,12.5 C13.4,13.3 14.6,14.0 15.8,14.5")
        }
    }

    /** gear that looks chewed */
    val Settings: ImageVector by lazy {
        icon("DoodleSettings") {
            ink(data = "M10.4,4.4 L13.8,4.2 L14.4,6.4 C15.2,6.7 15.8,7.1 16.5,7.7 L18.7,7.0 L20.3,9.9 L18.7,11.4 C18.8,12.2 18.8,12.9 18.6,13.7 L20.2,15.3 L18.4,18.1 L16.2,17.4 C15.6,18.0 14.9,18.4 14.1,18.7 L13.6,21.0 L10.2,21.0 L9.8,18.7 C9.0,18.4 8.3,18.0 7.7,17.4 L5.4,18.0 L3.8,15.1 L5.5,13.6 C5.4,12.8 5.4,12.1 5.5,11.3 L3.9,9.8 L5.7,7.0 L7.9,7.7 C8.5,7.2 9.2,6.7 9.9,6.5 Z")
            ink(2.0f, "M12.1,9.7 C10.5,9.8 9.6,11.0 9.7,12.4 C9.8,13.8 11.0,14.8 12.3,14.7 C13.7,14.6 14.7,13.4 14.6,12.0 C14.5,10.7 13.4,9.6 12.1,9.7 Z")
            ghost("M12.0,10.3 C11.0,10.4 10.3,11.2 10.4,12.2")
        }
    }

    /** plus drawn twice because the first one wasn't committed enough */
    val Add: ImageVector by lazy {
        icon("DoodleAdd") {
            ink(2.6f, "M12.2,4.6 C11.8,8.0 11.9,10.4 12.0,12.2 C12.0,14.4 12.1,16.6 12.3,19.6")
            ink(2.6f, "M4.6,12.3 C8.2,11.7 10.6,11.8 12.4,12.0 C14.6,12.1 16.8,12.0 19.6,11.8")
            ghost("M12.0,5.4 C11.7,8.4 11.8,10.8 11.9,12.4")
            ghost("M5.4,12.1 C8.4,11.8 10.8,11.9 12.4,12.1")
        }
    }

    /** arrow that curls back like a scribble */
    val Back: ImageVector by lazy {
        icon("DoodleBack") {
            ink(2.2f, "M19.4,12.3 C15.0,11.7 10.6,11.8 6.4,12.2")
            ink(2.2f, "M11.2,5.8 C8.8,7.8 6.8,9.8 5.2,12.1 C6.9,14.2 8.9,16.3 11.4,18.3")
            ghost("M18.6,12.1 C14.8,11.8 11.2,11.9 7.6,12.2")
        }
    }

    /** delete: crossed-out scribble, not a bin */
    val Delete: ImageVector by lazy {
        icon("DoodleDelete") {
            ink(2.2f, "M6.2,6.6 C10.2,10.2 13.8,13.8 17.6,17.8")
            ink(2.2f, "M17.8,6.2 C13.6,10.4 10.0,14.0 6.4,17.6")
            ghost("M7.0,7.4 C10.6,10.8 13.6,13.8 16.8,17.0")
        }
    }

    /** calendar with a scribbled-in day */
    val Calendar: ImageVector by lazy {
        icon("DoodleCalendar") {
            ink(data = "M5.0,7.6 C4.6,11.2 4.8,15.0 5.3,18.4 C9.4,19.1 14.8,18.9 19.0,18.3 C19.5,14.7 19.4,10.8 19.0,7.3 C14.5,6.7 9.3,6.9 5.0,7.6 Z")
            ink(2.2f, "M8.3,4.4 C8.2,6.2 8.3,7.6 8.5,9.2")
            ink(2.2f, "M15.7,4.2 C15.7,6.0 15.8,7.4 16.0,9.0")
            ghost("M5.4,11.0 C10.0,10.6 14.6,10.6 18.8,10.9")
            ink(2.4f, "M8.8,13.6 C9.8,14.5 10.4,15.3 10.9,16.0 C11.9,14.2 13.4,12.3 15.4,10.6")
        }
    }

    /** loopy repeat arrows */
    val Repeat: ImageVector by lazy {
        icon("DoodleRepeat") {
            ink(2.0f, "M6.8,9.4 C7.6,6.9 9.7,5.4 12.3,5.5 C15.4,5.6 17.8,7.8 18.2,10.8 L16.4,9.6 M18.2,10.8 L19.8,9.2")
            ink(2.0f, "M17.4,14.6 C16.6,17.1 14.4,18.6 11.8,18.5 C8.7,18.4 6.3,16.1 5.9,13.1 L7.7,14.3 M5.9,13.1 L4.3,14.7")
        }
    }

    /** heart drawn fast, lopsided */
    val Heart: ImageVector by lazy {
        icon("DoodleHeart") {
            ink(2.1f, "M12.1,19.8 C8.7,16.9 5.0,13.7 4.5,10.0 C4.1,7.2 6.2,5.0 8.6,5.5 C10.3,5.8 11.4,7.2 12.0,8.6 C12.8,7.1 14.2,5.6 16.0,5.4 C18.4,5.2 20.2,7.4 19.7,10.3 C19.1,13.9 15.4,16.9 12.1,19.8 Z")
            ghost("M11.9,18.6 C9.0,16.1 6.0,13.3 5.5,10.2")
        }
    }

    /** wonky sparkle/star */
    val Sparkle: ImageVector by lazy {
        icon("DoodleSparkle") {
            ink(2.2f, "M12.1,3.6 C12.5,7.0 12.5,8.6 12.2,12.1 C12.0,15.4 12.1,17.0 12.2,20.5")
            ink(2.2f, "M3.7,12.2 C7.2,11.8 8.7,11.9 12.2,12.1 C15.5,12.2 17.1,12.2 20.4,11.9")
            ink(1.6f, "M7.0,7.1 C7.9,8.0 8.5,8.6 9.3,9.5")
            ink(1.6f, "M14.9,14.8 C15.8,15.7 16.4,16.3 17.2,17.2")
            ink(1.6f, "M17.1,7.0 C16.2,7.9 15.6,8.5 14.7,9.4")
            ink(1.6f, "M9.2,14.9 C8.3,15.8 7.7,16.4 6.8,17.3")
        }
    }

    /** lightning bolt, jittery */
    val Energy: ImageVector by lazy {
        icon("DoodleEnergy") {
            ink(2.1f, "M13.6,3.8 C11.2,7.0 9.4,9.6 7.6,12.4 L11.4,12.7 C10.6,15.4 10.0,17.7 9.6,20.3 C12.4,16.9 14.6,14.0 16.6,11.2 L12.7,10.9 C13.1,8.5 13.4,6.2 13.6,3.8 Z")
        }
    }

    /** hourglass timer, pinched */
    val Timer: ImageVector by lazy {
        icon("DoodleTimer") {
            ink(2.0f, "M7.2,4.6 C10.4,4.3 13.8,4.3 16.9,4.7 C16.6,8.0 14.8,10.2 12.2,12.0 C14.9,13.9 16.7,16.1 16.8,19.4 C13.6,19.8 10.2,19.8 7.1,19.3 C7.3,16.0 9.1,13.8 11.8,12.0 C9.2,10.1 7.4,7.9 7.2,4.6 Z")
            ghost("M8.0,5.4 C8.4,7.9 9.8,9.8 11.8,11.4")
        }
    }

    /** bar chart, bars lean like they're tired */
    val Stats: ImageVector by lazy {
        icon("DoodleStats") {
            ink(2.3f, "M6.2,19.0 C6.3,16.6 6.3,14.6 6.1,12.4")
            ink(2.3f, "M11.9,19.2 C12.2,15.0 12.2,10.8 11.8,6.2")
            ink(2.3f, "M17.6,19.0 C17.9,16.0 17.9,12.6 17.5,9.4")
            ghost("M4.4,20.2 C9.6,20.6 14.8,20.6 20.0,20.1")
        }
    }

    /** floppy disk, corners chewed */
    val Save: ImageVector by lazy {
        icon("DoodleSave") {
            ink(data = "M5.4,5.8 C5.0,9.8 5.1,14.0 5.5,18.2 C9.6,18.8 14.2,18.7 18.4,18.1 C18.8,14.4 18.8,10.6 18.4,7.6 L16.2,5.3 C12.6,5.0 8.9,5.2 5.4,5.8 Z")
            ink(1.8f, "M8.6,5.6 C8.5,7.2 8.6,8.2 8.8,9.6 C10.9,9.9 12.9,9.9 14.9,9.6 C15.1,8.2 15.1,7.0 15.0,5.5")
            ghost("M8.4,13.2 C10.9,12.9 13.3,12.9 15.7,13.1")
        }
    }

    /** arrow diving into a box */
    val Import: ImageVector by lazy {
        icon("DoodleImport") {
            ink(2.2f, "M12.1,3.8 C11.8,7.4 11.9,10.2 12.1,13.6")
            ink(2.2f, "M8.4,10.4 C9.8,11.9 11.0,13.0 12.1,14.0 C13.3,12.9 14.5,11.7 15.8,10.2")
            ink(2.0f, "M5.2,14.8 C5.0,16.8 5.1,18.0 5.4,19.6 C9.7,20.2 14.3,20.1 18.6,19.5 C18.9,17.9 18.9,16.6 18.8,14.6")
        }
    }

    /** broom mid-sweep with dust */
    val Sweep: ImageVector by lazy {
        icon("DoodleSweep") {
            ink(2.1f, "M18.6,4.6 C15.4,7.6 12.8,10.2 10.4,12.8")
            ink(2.0f, "M10.6,12.4 C8.4,13.2 6.9,14.9 6.2,17.6 C8.9,18.5 11.4,18.2 13.4,16.4 C13.0,14.8 12.0,13.4 10.6,12.4 Z")
            ghost("M7.4,15.0 C8.4,16.4 9.8,17.3 11.6,17.4")
            ink(1.5f, "M4.4,20.6 L5.0,20.5 M7.8,21.0 L8.4,20.9 M11.6,20.8 L12.2,20.7")
        }
    }

    /** bell swinging, off balance */
    val Bell: ImageVector by lazy {
        icon("DoodleBell") {
            ink(2.0f, "M12.3,4.3 C8.9,4.6 7.1,7.1 7.0,10.1 C6.9,12.9 6.3,14.8 4.9,16.6 C9.5,17.4 14.9,17.3 19.3,16.4 C17.8,14.6 17.5,12.8 17.4,10.0 C17.3,6.9 15.5,4.5 12.3,4.3 Z")
            ghost("M11.9,4.9 C9.3,5.2 7.9,7.3 7.8,9.9")
            ink(2.0f, "M10.3,19.3 C11.3,20.5 13.1,20.4 14.0,19.2")
        }
    }

    /** angle brackets, hastily scratched */
    val Code: ImageVector by lazy {
        icon("DoodleCode") {
            ink(2.2f, "M8.6,7.0 C6.8,8.7 5.4,10.4 4.2,12.2 C5.6,13.9 7.0,15.4 8.8,17.0")
            ink(2.2f, "M15.4,7.2 C17.2,8.9 18.6,10.6 19.8,12.4 C18.4,14.1 17.0,15.6 15.2,17.2")
            ghost("M12.9,5.4 C12.0,9.8 11.4,14.2 11.0,18.8")
        }
    }
}
