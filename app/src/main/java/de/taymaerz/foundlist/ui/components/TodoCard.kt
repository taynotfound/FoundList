package de.taymaerz.foundlist.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import de.taymaerz.foundlist.data.Priority
import de.taymaerz.foundlist.data.Recurrence
import de.taymaerz.foundlist.data.Todo
import de.taymaerz.foundlist.ui.theme.DoodleIcons
import java.text.DateFormat
import java.util.Date

@Composable
fun TodoCard(
    todo: Todo,
    onToggle: () -> Unit,
    onClick: () -> Unit,
    onDelete: () -> Unit,
    subtaskProgress: Pair<Int, Int>? = null,
) {
    var confirmDelete by remember { mutableStateOf(false) }
    val overdue = !todo.done && todo.dueAt != null && todo.dueAt < System.currentTimeMillis()
    // gentle overdue: tertiary tint, never alarm-red
    val hintColor = if (overdue) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.onSurfaceVariant

    Card(onClick = onClick) {
        Column {
            Row(
                Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Checkbox(checked = todo.done, onCheckedChange = { onToggle() })
                Column(Modifier.weight(1f).padding(vertical = 12.dp)) {
                    Text(
                        todo.title,
                        style = MaterialTheme.typography.titleMedium,
                        textDecoration = if (todo.done) TextDecoration.LineThrough else null,
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        if (todo.priority == Priority.HIGH) Text("High", color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.labelMedium)
                        if (todo.category.isNotBlank()) Text(todo.category, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        todo.dueAt?.let {
                            Icon(DoodleIcons.Calendar, null, Modifier.size(14.dp), tint = hintColor)
                            Text(
                                DateFormat.getDateInstance(DateFormat.SHORT).format(Date(it)),
                                style = MaterialTheme.typography.labelMedium,
                                color = hintColor,
                            )
                        }
                        if (todo.recurrence != Recurrence.NONE) Icon(DoodleIcons.Repeat, "recurring", Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        subtaskProgress?.let { (done, total) ->
                            Text("$done/$total", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
                IconButton(onClick = { confirmDelete = true }) {
                    Icon(DoodleIcons.Delete, "Delete", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            subtaskProgress?.let { (done, total) ->
                if (total > 0) LinearProgressIndicator(
                    progress = { done.toFloat() / total },
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).padding(bottom = 8.dp),
                )
            }
        }
    }

    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text("Delete task?") },
            text = { Text("\u201C${todo.title}\u201D will be removed permanently.") },
            confirmButton = { TextButton(onClick = { confirmDelete = false; onDelete() }) { Text("Delete") } },
            dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("Cancel") } },
        )
    }
}
