package de.taymaerz.foundlist.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface TodoDao {
    @Query("SELECT COUNT(*) FROM todos WHERE done = 1")
    suspend fun completedCount(): Int

    @Query("SELECT * FROM todos WHERE done = 0 ORDER BY CASE WHEN dueAt IS NULL THEN 1 ELSE 0 END, dueAt ASC, priority DESC, createdAt DESC")
    fun open(): Flow<List<Todo>>

    @Query("SELECT * FROM todos WHERE done = 1 ORDER BY doneAt DESC LIMIT 200")
    fun completed(): Flow<List<Todo>>

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
}
