package de.taymaerz.foundlist.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.appwidget.updateAll
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import de.taymaerz.foundlist.MainActivity
import de.taymaerz.foundlist.data.TodoDatabase

class TodoWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = TodoWidget()
}

/** Called by the repository after every data change so the widget never goes stale. */
suspend fun refreshTodoWidget(context: Context) {
    TodoWidget().updateAll(context)
}

/** Doodle accent colors - one per task row, cycled. */
private val inks = listOf(
    Color(0xFF4DD9E0), Color(0xFFF9A03F), Color(0xFFB39DDB),
    Color(0xFF81C784), Color(0xFFF48FB1),
)

/**
 * Glance can't draw vectors, so the doodles are rendered to bitmaps:
 * a wobbly checkbox per row and a squiggle divider. Hand-drawn feel, real pixels.
 */
private fun doodleBox(color: Int, size: Int = 44): Bitmap {
    val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val c = Canvas(bmp)
    val s = size / 24f
    val p = Paint().apply {
        this.color = color; style = Paint.Style.STROKE; strokeWidth = 2.4f * s
        strokeCap = Paint.Cap.ROUND; strokeJoin = Paint.Join.ROUND; isAntiAlias = true
    }
    // saggy box
    val box = Path().apply {
        moveTo(4.6f * s, 5.4f * s)
        cubicTo(3.9f * s, 9.0f * s, 4.1f * s, 14.6f * s, 4.8f * s, 18.6f * s)
        cubicTo(9.0f * s, 19.5f * s, 14.6f * s, 19.3f * s, 18.8f * s, 18.5f * s)
        cubicTo(19.6f * s, 14.4f * s, 19.4f * s, 9.2f * s, 18.9f * s, 5.2f * s)
        cubicTo(14.4f * s, 4.4f * s, 8.6f * s, 4.6f * s, 4.6f * s, 5.4f * s)
        close()
    }
    c.drawPath(box, p)
    return bmp
}

private fun doodleSquiggle(color: Int, w: Int = 560, h: Int = 16): Bitmap {
    val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
    val c = Canvas(bmp)
    val p = Paint().apply {
        this.color = color; style = Paint.Style.STROKE; strokeWidth = 3f
        strokeCap = Paint.Cap.ROUND; isAntiAlias = true
    }
    val path = Path().apply {
        moveTo(4f, h / 2f)
        var x = 4f
        while (x < w - 4) {
            val next = (x + 26f).coerceAtMost(w - 4f)
            quadTo(x + 13f, h / 2f + (if ((x / 26).toInt() % 2 == 0) -5f else 5f), next, h / 2f)
            x = next
        }
    }
    c.drawPath(path, p)
    return bmp
}

class TodoWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val tasks = TodoDatabase.get(context).todos().topOpen()
        val squiggle = doodleSquiggle(inks[0].copy(alpha = 0.6f).toArgb())
        val boxes = tasks.mapIndexed { i, _ -> doodleBox(inks[i % inks.size].toArgb()) }

        provideContent {
            Column(
                modifier = GlanceModifier.fillMaxSize()
                    .background(Color(0xFF15181A))
                    .cornerRadius(24.dp)
                    .padding(14.dp)
                    .clickable(actionStartActivity<MainActivity>()),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "today~",
                        style = TextStyle(
                            color = ColorProvider(Color(0xFF4DD9E0)),
                            fontWeight = FontWeight.Bold, fontSize = 16.sp,
                        ),
                    )
                    Spacer(GlanceModifier.width(8.dp))
                    Text(
                        if (tasks.isEmpty()) "✧" else "${tasks.size} things",
                        style = TextStyle(color = ColorProvider(Color(0xFF7A8C8E)), fontSize = 12.sp),
                    )
                }
                Image(ImageProvider(squiggle), null, GlanceModifier.fillMaxWidth().height(8.dp).padding(vertical = 0.dp))
                Spacer(GlanceModifier.height(6.dp))
                if (tasks.isEmpty()) {
                    Text(
                        "nothing to do.\nenjoy the quiet ✨",
                        style = TextStyle(color = ColorProvider(Color(0xFFB1CBCD)), fontSize = 14.sp),
                    )
                } else {
                    tasks.forEachIndexed { i, t ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = GlanceModifier.fillMaxWidth().padding(vertical = 3.dp),
                        ) {
                            Image(ImageProvider(boxes[i]), null, GlanceModifier.size(20.dp))
                            Spacer(GlanceModifier.width(10.dp))
                            Text(
                                t.title,
                                maxLines = 1,
                                style = TextStyle(color = ColorProvider(Color(0xFFE6E9E9)), fontSize = 14.sp),
                            )
                        }
                    }
                }
            }
        }
    }
}
