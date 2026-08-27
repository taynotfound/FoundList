package de.taymaerz.foundlist.ui.screens

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import de.taymaerz.foundlist.data.TodoRepository
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(repo: TodoRepository, outerPadding: PaddingValues) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var confirmClear by remember { mutableStateOf(false) }

    Scaffold(
        modifier = Modifier.padding(outerPadding),
        topBar = { TopAppBar(title = { Text("Settings") }) },
    ) { padding ->
        Column(Modifier.padding(padding)) {
            ListItem(
                headlineContent = { Text("Notification settings") },
                supportingContent = { Text("Manage reminder notifications in system settings") },
                leadingContent = { Icon(Icons.Default.Notifications, null) },
                modifier = Modifier.clickableItem {
                    context.startActivity(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                        putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                    })
                },
            )
            ListItem(
                headlineContent = { Text("Clear completed tasks") },
                supportingContent = { Text("Remove everything in History") },
                leadingContent = { Icon(Icons.Default.DeleteSweep, null) },
                modifier = Modifier.clickableItem { confirmClear = true },
            )
            ListItem(
                headlineContent = { Text("Source code") },
                supportingContent = { Text("github.com/taynotfound/FoundList") },
                leadingContent = { Icon(Icons.Default.Code, null) },
                modifier = Modifier.clickableItem {
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://github.com/taynotfound/FoundList")))
                },
            )
            Spacer(Modifier.weight(1f))
            Text(
                "FoundList 3.0.0 \u00B7 Android ${Build.VERSION.RELEASE}",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(16.dp),
            )
        }
    }

    if (confirmClear) {
        AlertDialog(
            onDismissRequest = { confirmClear = false },
            title = { Text("Clear completed tasks?") },
            text = { Text("This permanently deletes all completed tasks.") },
            confirmButton = { TextButton(onClick = { confirmClear = false; scope.launch { repo.clearCompleted() } }) { Text("Clear") } },
            dismissButton = { TextButton(onClick = { confirmClear = false }) { Text("Cancel") } },
        )
    }
}

private fun Modifier.clickableItem(onClick: () -> Unit): Modifier = clickable(onClick = onClick)
