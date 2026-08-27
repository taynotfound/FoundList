package de.taymaerz.foundlist

import android.app.Application
import de.taymaerz.foundlist.data.TodoRepository
import de.taymaerz.foundlist.reminders.Reminders

class FoundListApp : Application() {
    val repository by lazy { TodoRepository(this) }

    override fun onCreate() {
        super.onCreate()
        de.taymaerz.foundlist.util.Prefs.init(this)
        Reminders.ensureChannel(this)
    }
}
