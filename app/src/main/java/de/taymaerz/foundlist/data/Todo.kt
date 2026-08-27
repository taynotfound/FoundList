package de.taymaerz.foundlist.data

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

enum class Priority { LOW, MEDIUM, HIGH }

enum class Recurrence { NONE, DAILY, WEEKLY, MONTHLY }

enum class Energy { ANY, LOW, HIGH }

@Entity(tableName = "todos")
data class Todo(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val notes: String = "",
    val category: String = "",
    val priority: Priority = Priority.MEDIUM,
    val energy: Energy = Energy.ANY,
    val dueAt: Long? = null,          // epoch millis, null = no due date
    val reminderAt: Long? = null,     // epoch millis, null = no reminder
    val recurrence: Recurrence = Recurrence.NONE,
    val done: Boolean = false,
    val doneAt: Long? = null,
    val createdAt: Long = System.currentTimeMillis(),
)

@Entity(
    tableName = "subtasks",
    foreignKeys = [ForeignKey(
        entity = Todo::class, parentColumns = ["id"], childColumns = ["todoId"],
        onDelete = ForeignKey.CASCADE,
    )],
    indices = [Index("todoId")],
)
data class Subtask(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val todoId: Long,
    val title: String,
    val done: Boolean = false,
    val position: Int = 0,
)

/** Reusable one-tap templates for common chores. */
@Entity(tableName = "templates")
data class Template(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val category: String = "",
    val priority: Priority = Priority.MEDIUM,
    val energy: Energy = Energy.ANY,
    val recurrence: Recurrence = Recurrence.NONE,
)
