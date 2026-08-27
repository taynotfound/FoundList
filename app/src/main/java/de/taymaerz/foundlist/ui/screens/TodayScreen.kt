package de.taymaerz.foundlist.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import de.taymaerz.foundlist.data.Todo
import de.taymaerz.foundlist.data.TodoRepository
import de.taymaerz.foundlist.ui.components.TodoCard
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TodayScreen(repo: TodoRepository, outerPadding: PaddingValues, onEdit: (Long) -> Unit) {
    val todos by repo.open.collectAsState(initial = emptyList())
    val scope = rememberCoroutineScope()
    var query by remember { mutableStateOf("") }

    val filtered = if (query.isBlank()) todos else todos.filter {
        it.title.contains(query, true) || it.notes.contains(query, true) || it.category.contains(query, true)
    }

    Scaffold(
        modifier = Modifier.padding(outerPadding),
        topBar = { TopAppBar(title = { Text("Today") }) },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { onEdit(0L) },
                icon = { Icon(Icons.Default.Add, null) },
                text = { Text("New task") },
            )
        },
    ) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                placeholder = { Text("Search tasks") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
            )
            if (filtered.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        if (query.isBlank()) "Nothing to do right now.\nEnjoy the quiet, or add a task."
                        else "No tasks match your search.",
                        style = MaterialTheme.typography.bodyLarge,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(filtered, key = { it.id }) { todo ->
                        TodoCard(
                            todo = todo,
                            onToggle = { scope.launch { repo.setDone(todo, !todo.done) } },
                            onClick = { onEdit(todo.id) },
                            onDelete = { scope.launch { repo.delete(todo) } },
                        )
                    }
                    item { Spacer(Modifier.height(80.dp)) } // FAB clearance
                }
            }
        }
    }
}
