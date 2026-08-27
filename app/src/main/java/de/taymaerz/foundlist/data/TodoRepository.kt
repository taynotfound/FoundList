package de.taymaerz.foundlist.data

import android.content.Context
import de.taymaerz.foundlist.reminders.Reminders
import java.util.Calendar

class TodoRepository(private val context: Context) {
    private val dao = TodoDatabase.get(context).todos()

    val open = dao.open()
    val completed = dao.completed()
    val categories = dao.categories()
    val templates = dao.templates()

    fun completedSince(since: Long) = dao.completedSince(since)
    fun overdueCount() = dao.overdueCount(System.currentTimeMillis())
    fun completedCountFlow() = dao.completedCountFlow()
    fun subtasks(todoId: Long) = dao.subtasks(todoId)

    suspend fun upsertSubtask(s: Subtask) = dao.upsertSubtask(s)
    suspend fun deleteSubtask(s: Subtask) = dao.deleteSubtask(s)
    suspend fun upsertTemplate(t: Template) = dao.upsertTemplate(t)
    suspend fun deleteTemplate(t: Template) = dao.deleteTemplate(t)
    suspend fun completedAll() = dao.completedAll()

    /** Export everything as JSON (via org.json - in the Android SDK). */
    suspend fun exportJson(): String {
        val root = org.json.JSONObject()
        root.put("version", 2)
        root.put("todos", org.json.JSONArray(dao.all().map { t ->
            org.json.JSONObject()
                .put("title", t.title).put("notes", t.notes).put("category", t.category)
                .put("priority", t.priority.name).put("energy", t.energy.name)
                .put("dueAt", t.dueAt ?: org.json.JSONObject.NULL)
                .put("reminderAt", t.reminderAt ?: org.json.JSONObject.NULL)
                .put("recurrence", t.recurrence.name).put("done", t.done)
                .put("doneAt", t.doneAt ?: org.json.JSONObject.NULL)
                .put("createdAt", t.createdAt).put("id", t.id)
        }))
        root.put("subtasks", org.json.JSONArray(dao.allSubtasks().map { s ->
            org.json.JSONObject().put("todoId", s.todoId).put("title", s.title)
                .put("done", s.done).put("position", s.position)
        }))
        return root.toString(2)
    }

    /** Import from exportJson() output. Appends; old ids are remapped. */
    suspend fun importJson(json: String): Int {
        val root = org.json.JSONObject(json)
        val todos = root.getJSONArray("todos")
        val idMap = mutableMapOf<Long, Long>()
        for (i in 0 until todos.length()) {
            val o = todos.getJSONObject(i)
            val newId = dao.upsert(Todo(
                title = o.getString("title"), notes = o.optString("notes"),
                category = o.optString("category"),
                priority = Priority.valueOf(o.optString("priority", "MEDIUM")),
                energy = Energy.valueOf(o.optString("energy", "ANY")),
                dueAt = if (o.isNull("dueAt")) null else o.getLong("dueAt"),
                reminderAt = if (o.isNull("reminderAt")) null else o.getLong("reminderAt"),
                recurrence = Recurrence.valueOf(o.optString("recurrence", "NONE")),
                done = o.optBoolean("done"),
                doneAt = if (o.isNull("doneAt")) null else o.getLong("doneAt"),
                createdAt = o.optLong("createdAt", System.currentTimeMillis()),
            ))
            idMap[o.optLong("id")] = newId
        }
        val subs = root.optJSONArray("subtasks") ?: org.json.JSONArray()
        for (i in 0 until subs.length()) {
            val o = subs.getJSONObject(i)
            idMap[o.getLong("todoId")]?.let { newId ->
                dao.upsertSubtask(Subtask(
                    todoId = newId, title = o.getString("title"),
                    done = o.optBoolean("done"), position = o.optInt("position"),
                ))
            }
        }
        return todos.length()
    }

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
