package de.taymaerz.foundlist.data

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class Priority { LOW, MEDIUM, HIGH }

enum class Recurrence { NONE, DAILY, WEEKLY, MONTHLY }

@Entity(tableName = "todos")
data class Todo(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val notes: String = "",
    val category: String = "",
    val priority: Priority = Priority.MEDIUM,
    val dueAt: Long? = null,          // epoch millis, null = no due date
    val reminderAt: Long? = null,     // epoch millis, null = no reminder
    val recurrence: Recurrence = Recurrence.NONE,
    val done: Boolean = false,
    val doneAt: Long? = null,
    val createdAt: Long = System.currentTimeMillis(),
)
