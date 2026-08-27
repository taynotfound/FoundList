package de.taymaerz.foundlist.reminders

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import de.taymaerz.foundlist.data.Todo

object Reminders {
    const val CHANNEL_ID = "todo_reminders"

    fun ensureChannel(context: Context) {
        val nm = context.getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL_ID, "Task reminders", NotificationManager.IMPORTANCE_HIGH)
        )
    }

    fun schedule(context: Context, todo: Todo) {
        val at = todo.reminderAt ?: return
        if (at <= System.currentTimeMillis()) return
        val am = context.getSystemService(AlarmManager::class.java)
        val pi = pending(context, todo.id, todo.title)
        // exact if allowed, inexact otherwise — a todo reminder a minute late is fine
        if (Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms()) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
        } else {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
        }
    }

    fun cancel(context: Context, id: Long) {
        val am = context.getSystemService(AlarmManager::class.java)
        am.cancel(pending(context, id, ""))
    }

    private fun pending(context: Context, id: Long, title: String): PendingIntent {
        val intent = Intent(context, ReminderReceiver::class.java)
            .putExtra("id", id)
            .putExtra("title", title)
        return PendingIntent.getBroadcast(
            context, id.toInt(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}
