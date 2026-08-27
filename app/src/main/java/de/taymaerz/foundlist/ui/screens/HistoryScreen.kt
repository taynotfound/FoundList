package de.taymaerz.foundlist.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import de.taymaerz.foundlist.data.TodoRepository
import de.taymaerz.foundlist.ui.components.TodoCard
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(repo: TodoRepository, outerPadding: PaddingValues) {
    val todos by repo.completed.collectAsState(initial = emptyList())
    val scope = rememberCoroutineScope()

    Scaffold(
        modifier = Modifier.padding(bottom = outerPadding.calculateBottomPadding()),
        topBar = { TopAppBar(title = { Text("History") }) },
    ) { padding ->
        if (todos.isEmpty()) {
            Box(Modifier.padding(padding).fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Completed tasks show up here.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            LazyColumn(
                Modifier.padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(todos, key = { it.id }) { todo ->
                    TodoCard(
                        todo = todo,
                        onToggle = { scope.launch { repo.setDone(todo, false) } },
                        onClick = {},
                        onDelete = { scope.launch { repo.delete(todo) } },
                    )
                }
            }
        }
    }
}
