package de.taymaerz.foundlist.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.Repeat
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import de.taymaerz.foundlist.data.Priority
import de.taymaerz.foundlist.data.Recurrence
import de.taymaerz.foundlist.data.Todo
import java.text.DateFormat
import java.util.Date

@Composable
fun TodoCard(todo: Todo, onToggle: () -> Unit, onClick: () -> Unit, onDelete: () -> Unit) {
    var confirmDelete by remember { mutableStateOf(false) }
    val overdue = !todo.done && todo.dueAt != null && todo.dueAt < System.currentTimeMillis()

    Card(onClick = onClick) {
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
                        Icon(Icons.Default.Event, null, Modifier.size(14.dp), tint = if (overdue) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            DateFormat.getDateInstance(DateFormat.SHORT).format(Date(it)),
                            style = MaterialTheme.typography.labelMedium,
                            color = if (overdue) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    if (todo.recurrence != Recurrence.NONE) Icon(Icons.Default.Repeat, "recurring", Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            IconButton(onClick = { confirmDelete = true }) {
                Icon(Icons.Default.Delete, "Delete", tint = MaterialTheme.colorScheme.onSurfaceVariant)
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
