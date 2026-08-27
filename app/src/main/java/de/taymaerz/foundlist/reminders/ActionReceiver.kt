package de.taymaerz.foundlist.reminders

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import de.taymaerz.foundlist.data.TodoRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Calendar

/** Handles notification action buttons: done, snooze 1h, snooze to tomorrow morning. */
class ActionReceiver : BroadcastReceiver() {
    companion object {
        const val ACTION_DONE = "de.taymaerz.foundlist.DONE"
        const val ACTION_SNOOZE_1H = "de.taymaerz.foundlist.SNOOZE_1H"
        const val ACTION_SNOOZE_TOMORROW = "de.taymaerz.foundlist.SNOOZE_TOMORROW"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getLongExtra("id", 0)
        context.getSystemService(NotificationManager::class.java).cancel(id.toInt())
        val pending = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val repo = TodoRepository(context.applicationContext)
                val todo = repo.byId(id) ?: return@launch
                when (intent.action) {
                    ACTION_DONE -> repo.setDone(todo, true)
                    ACTION_SNOOZE_1H ->
                        repo.save(todo.copy(reminderAt = System.currentTimeMillis() + 60 * 60 * 1000))
                    ACTION_SNOOZE_TOMORROW -> {
                        val t = Calendar.getInstance().apply {
                            add(Calendar.DAY_OF_YEAR, 1)
                            set(Calendar.HOUR_OF_DAY, 9); set(Calendar.MINUTE, 0)
                            set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
                        }.timeInMillis
                        repo.save(todo.copy(reminderAt = t))
                    }
                }
            } finally {
                pending.finish()
            }
        }
    }
}
