package de.taymaerz.foundlist

import android.content.Intent
import android.service.quicksettings.TileService

/** Quick-settings tile: opens the app straight into the new-task editor. */
class QuickAddTileService : TileService() {
    override fun onClick() {
        val intent = Intent(this, MainActivity::class.java)
            .setAction("de.taymaerz.foundlist.NEW_TASK")
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        @Suppress("DEPRECATION")
        if (android.os.Build.VERSION.SDK_INT >= 34) {
            startActivityAndCollapse(
                android.app.PendingIntent.getActivity(
                    this, 0, intent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )
            )
        } else {
            startActivityAndCollapse(intent)
        }
    }
}
