package de.taymaerz.foundlist.data

import android.content.Context
import de.taymaerz.foundlist.reminders.Reminders
import java.util.Calendar

class TodoRepository(private val context: Context) {
    private val dao = TodoDatabase.get(context).todos()

    val open = dao.open()
    val completed = dao.completed()
    val categories = dao.categories()

    suspend fun byId(id: Long) = dao.byId(id)

    suspend fun save(todo: Todo): Long {
        val id = dao.upsert(todo)
        val saved = todo.copy(id = if (todo.id == 0L) id else todo.id)
        if (saved.reminderAt != null && !saved.done) Reminders.schedule(context, saved)
        else Reminders.cancel(context, saved.id)
        return saved.id
    }

    suspend fun setDone(todo: Todo, done: Boolean) {
        if (done && todo.recurrence != Recurrence.NONE) {
            // recurring: complete this instance, roll due/reminder forward
            dao.upsert(todo.copy(done = true, doneAt = System.currentTimeMillis()))
            Reminders.cancel(context, todo.id)
            val next = todo.copy(
                id = 0,
                done = false,
                doneAt = null,
                dueAt = todo.dueAt?.let { roll(it, todo.recurrence) },
                reminderAt = todo.reminderAt?.let { roll(it, todo.recurrence) },
                createdAt = System.currentTimeMillis(),
            )
            save(next)
        } else {
            dao.upsert(todo.copy(done = done, doneAt = if (done) System.currentTimeMillis() else null))
            if (done) Reminders.cancel(context, todo.id)
            else if (todo.reminderAt != null) Reminders.schedule(context, todo)
        }
    }

    suspend fun delete(todo: Todo) {
        Reminders.cancel(context, todo.id)
        dao.delete(todo)
    }

    suspend fun clearCompleted() = dao.clearCompleted()

    /** Encouragement line after completing a task: milestone when hit, else a varied toast. */
    suspend fun completionMessage(): String {
        val total = dao.completedCount()
        return de.taymaerz.foundlist.util.Encourage.milestone(total)
            ?: de.taymaerz.foundlist.util.Encourage.completion()
    }

    private fun roll(ts: Long, r: Recurrence): Long {
        val cal = Calendar.getInstance().apply { timeInMillis = ts }
        do {
            when (r) {
                Recurrence.DAILY -> cal.add(Calendar.DAY_OF_YEAR, 1)
                Recurrence.WEEKLY -> cal.add(Calendar.WEEK_OF_YEAR, 1)
                Recurrence.MONTHLY -> cal.add(Calendar.MONTH, 1)
                Recurrence.NONE -> return ts
            }
        } while (cal.timeInMillis <= System.currentTimeMillis())
        return cal.timeInMillis
    }
}
