package de.taymaerz.foundlist.reminders

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import de.taymaerz.foundlist.MainActivity
import de.taymaerz.foundlist.R
import de.taymaerz.foundlist.util.Encourage

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getLongExtra("id", 0)
        val title = intent.getStringExtra("title") ?: "Task reminder"
        Reminders.ensureChannel(context)
        val tap = PendingIntent.getActivity(
            context, 0, Intent(context, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        fun action(act: String): PendingIntent = PendingIntent.getBroadcast(
            context, (id * 10 + act.hashCode() % 7).toInt(),
            Intent(context, ActionReceiver::class.java)
                .setAction(act).putExtra("id", id).putExtra("title", title),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notif = NotificationCompat.Builder(context, Reminders.CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(Encourage.reminder(title))
            .setContentText("Tap to open FoundList")
            .setContentIntent(tap)
            .setAutoCancel(true)
            .addAction(0, "Done", action(ActionReceiver.ACTION_DONE))
            .addAction(0, "In 1h", action(ActionReceiver.ACTION_SNOOZE_1H))
            .addAction(0, "Tomorrow", action(ActionReceiver.ACTION_SNOOZE_TOMORROW))
            .build()
        context.getSystemService(NotificationManager::class.java).notify(id.toInt(), notif)
    }
}
