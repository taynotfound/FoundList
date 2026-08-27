package de.taymaerz.foundlist.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [Todo::class], version = 1, exportSchema = false)
abstract class TodoDatabase : RoomDatabase() {
    abstract fun todos(): TodoDao

    companion object {
        @Volatile private var instance: TodoDatabase? = null

        fun get(context: Context): TodoDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext, TodoDatabase::class.java, "foundlist.db"
                ).build().also { instance = it }
            }
    }
}
