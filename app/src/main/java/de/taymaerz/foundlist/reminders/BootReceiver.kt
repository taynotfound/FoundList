package de.taymaerz.foundlist.reminders

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import de.taymaerz.foundlist.data.TodoDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        val pending = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                TodoDatabase.get(context).todos().open().first()
                    .filter { it.reminderAt != null && it.reminderAt > System.currentTimeMillis() }
                    .forEach { Reminders.schedule(context, it) }
            } finally {
                pending.finish()
            }
        }
    }
}
