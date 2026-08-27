package de.taymaerz.foundlist.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface TodoDao {
    @Query("SELECT COUNT(*) FROM todos WHERE done = 1")
    suspend fun completedCount(): Int

    @Query("SELECT COUNT(*) FROM todos WHERE done = 1 AND priority = :prio")
    fun completedByPriority(prio: Priority): Flow<Int>

    @Query("SELECT COUNT(*) FROM todos WHERE done = 1")
    fun completedCountFlow(): Flow<Int>

    @Query("SELECT COUNT(*) FROM todos WHERE done = 1 AND doneAt >= :since")
    fun completedSince(since: Long): Flow<Int>

    @Query("SELECT COUNT(*) FROM todos WHERE done = 0 AND dueAt IS NOT NULL AND dueAt < :now")
    fun overdueCount(now: Long): Flow<Int>

    @Query("SELECT * FROM todos WHERE done = 0 ORDER BY CASE WHEN dueAt IS NULL THEN 1 ELSE 0 END, dueAt ASC, priority DESC, createdAt DESC")
    fun open(): Flow<List<Todo>>

    @Query("SELECT * FROM todos WHERE done = 1 ORDER BY doneAt DESC LIMIT 200")
    fun completed(): Flow<List<Todo>>

    @Query("SELECT * FROM todos WHERE done = 1 ORDER BY doneAt DESC")
    suspend fun completedAll(): List<Todo>

    @Query("SELECT * FROM todos WHERE done = 0 ORDER BY CASE WHEN dueAt IS NULL THEN 1 ELSE 0 END, dueAt ASC, priority DESC LIMIT 5")
    suspend fun topOpen(): List<Todo>

    @Query("SELECT * FROM todos WHERE id = :id")
    suspend fun byId(id: Long): Todo?

    @Query("SELECT DISTINCT category FROM todos WHERE category != '' ORDER BY category")
    fun categories(): Flow<List<String>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(todo: Todo): Long

    @Delete
    suspend fun delete(todo: Todo)

    @Query("DELETE FROM todos WHERE done = 1")
    suspend fun clearCompleted()

    // --- subtasks ---
    @Query("SELECT * FROM subtasks WHERE todoId = :todoId ORDER BY position")
    fun subtasks(todoId: Long): Flow<List<Subtask>>

    @Query("SELECT * FROM subtasks WHERE todoId IN (:todoIds)")
    fun subtasksFor(todoIds: List<Long>): Flow<List<Subtask>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertSubtask(s: Subtask): Long

    @Delete
    suspend fun deleteSubtask(s: Subtask)

    // --- templates ---
    @Query("SELECT * FROM templates ORDER BY title")
    fun templates(): Flow<List<Template>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertTemplate(t: Template): Long

    @Delete
    suspend fun deleteTemplate(t: Template)

    // --- stats / export ---
    @Query("SELECT * FROM todos")
    suspend fun all(): List<Todo>

    @Query("SELECT * FROM subtasks")
    suspend fun allSubtasks(): List<Subtask>
}
