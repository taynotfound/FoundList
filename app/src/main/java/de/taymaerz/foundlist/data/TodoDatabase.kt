package de.taymaerz.foundlist.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

@Database(entities = [Todo::class, Subtask::class, Template::class], version = 2, exportSchema = false)
abstract class TodoDatabase : RoomDatabase() {
    abstract fun todos(): TodoDao

    companion object {
        @Volatile private var instance: TodoDatabase? = null

        private val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE todos ADD COLUMN energy TEXT NOT NULL DEFAULT 'ANY'")
                db.execSQL(
                    "CREATE TABLE IF NOT EXISTS subtasks (" +
                        "id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, " +
                        "todoId INTEGER NOT NULL, title TEXT NOT NULL, " +
                        "done INTEGER NOT NULL DEFAULT 0, position INTEGER NOT NULL DEFAULT 0, " +
                        "FOREIGN KEY(todoId) REFERENCES todos(id) ON DELETE CASCADE)"
                )
                db.execSQL("CREATE INDEX IF NOT EXISTS index_subtasks_todoId ON subtasks(todoId)")
                db.execSQL(
                    "CREATE TABLE IF NOT EXISTS templates (" +
                        "id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, " +
                        "title TEXT NOT NULL, category TEXT NOT NULL DEFAULT '', " +
                        "priority TEXT NOT NULL DEFAULT 'MEDIUM', energy TEXT NOT NULL DEFAULT 'ANY', " +
                        "recurrence TEXT NOT NULL DEFAULT 'NONE')"
                )
            }
        }

        fun get(context: Context): TodoDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext, TodoDatabase::class.java, "foundlist.db"
                ).addMigrations(MIGRATION_1_2).build().also { instance = it }
            }
    }
}
