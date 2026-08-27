package de.taymaerz.foundlist.widget

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.background
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import de.taymaerz.foundlist.MainActivity
import de.taymaerz.foundlist.data.TodoDatabase

class TodoWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = TodoWidget()
}

/** Simple glance widget: top open tasks, tap anywhere opens the app. */
class TodoWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val tasks = TodoDatabase.get(context).todos().topOpen()
        provideContent {
            Column(
                modifier = GlanceModifier.fillMaxSize()
                    .background(Color(0xFF191C1C))
                    .padding(12.dp)
                    .clickable(actionStartActivity<MainActivity>()),
            ) {
                Text(
                    "FoundList",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFF4DD9E0)),
                        fontWeight = FontWeight.Bold, fontSize = 14.sp,
                    ),
                )
                Spacer(GlanceModifier.height(6.dp))
                if (tasks.isEmpty()) {
                    Text(
                        "Nothing to do. Enjoy the quiet ✨",
                        style = TextStyle(color = ColorProvider(Color(0xFFB1CBCD)), fontSize = 13.sp),
                    )
                } else {
                    tasks.forEach { t ->
                        Text(
                            "◻ ${t.title}",
                            maxLines = 1,
                            style = TextStyle(color = ColorProvider(Color(0xFFE0E3E3)), fontSize = 13.sp),
                            modifier = GlanceModifier.fillMaxWidth().padding(vertical = 2.dp),
                        )
                    }
                }
            }
        }
    }
}
