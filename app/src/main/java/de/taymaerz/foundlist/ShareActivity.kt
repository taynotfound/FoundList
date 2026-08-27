package de.taymaerz.foundlist

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import de.taymaerz.foundlist.data.Todo
import de.taymaerz.foundlist.data.TodoRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/** Receives ACTION_SEND text from other apps and saves it as a task. No UI. */
class ShareActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val text = intent.getStringExtra(Intent.EXTRA_TEXT)?.trim()
        if (!text.isNullOrEmpty()) {
            val title = text.lineSequence().first().take(200)
            val notes = text.lineSequence().drop(1).joinToString("\n").take(2000)
            CoroutineScope(Dispatchers.IO).launch {
                TodoRepository(applicationContext).save(Todo(title = title, notes = notes))
            }
            Toast.makeText(this, "Added to FoundList ✔", Toast.LENGTH_SHORT).show()
        }
        finish()
    }
}
