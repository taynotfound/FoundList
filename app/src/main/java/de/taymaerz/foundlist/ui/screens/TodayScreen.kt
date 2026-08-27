package de.taymaerz.foundlist.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import de.taymaerz.foundlist.data.Energy
import de.taymaerz.foundlist.data.Todo
import de.taymaerz.foundlist.data.TodoRepository
import de.taymaerz.foundlist.ui.components.TodoCard
import de.taymaerz.foundlist.ui.theme.DoodleIcons
import de.taymaerz.foundlist.util.Game
import de.taymaerz.foundlist.util.Prefs
import kotlinx.coroutines.launch
import java.util.Calendar

private fun startOfToday(): Long = Calendar.getInstance().apply {
    set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
    set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
}.timeInMillis

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TodayScreen(repo: TodoRepository, outerPadding: PaddingValues, onEdit: (Long) -> Unit) {
    val todos by repo.open.collectAsState(initial = emptyList())
    val doneToday by repo.completedSince(startOfToday()).collectAsState(initial = 0)
    val overdueCount by repo.overdueCount().collectAsState(initial = 0)
    val totalDone by repo.completedCountFlow().collectAsState(initial = 0)
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }
    var query by remember { mutableStateOf("") }
    var energyFilter by remember { mutableStateOf(Energy.ANY) }
    var justOne by remember { mutableStateOf(false) }

    val now = System.currentTimeMillis()
    val filtered = todos.filter { t ->
        (query.isBlank() || t.title.contains(query, true) || t.notes.contains(query, true) || t.category.contains(query, true)) &&
            (energyFilter == Energy.ANY || t.energy == energyFilter || t.energy == Energy.ANY)
    }
    val shown = if (justOne) filtered.take(1) else filtered
    val (overdue, current) = shown.partition { it.dueAt != null && it.dueAt < now }

    Scaffold(
        modifier = Modifier.padding(bottom = outerPadding.calculateBottomPadding()),
        topBar = { TopAppBar(title = { Text("Today") }) },
        snackbarHost = { SnackbarHost(snackbar) },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { onEdit(0L) },
                icon = { Icon(DoodleIcons.Add, null) },
                text = { Text("New task") },
            )
        },
    ) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            GamificationHeader(doneToday, overdueCount, totalDone)

            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                placeholder = { Text("Search tasks") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
            )

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(horizontal = 16.dp),
            ) {
                FilterChip(
                    selected = energyFilter == Energy.LOW,
                    onClick = { energyFilter = if (energyFilter == Energy.LOW) Energy.ANY else Energy.LOW },
                    label = { Text("Low energy") },
                    leadingIcon = { Icon(DoodleIcons.Energy, null, Modifier.size(16.dp)) },
                )
                FilterChip(
                    selected = energyFilter == Energy.HIGH,
                    onClick = { energyFilter = if (energyFilter == Energy.HIGH) Energy.ANY else Energy.HIGH },
                    label = { Text("High energy") },
                )
                FilterChip(
                    selected = justOne,
                    onClick = { justOne = !justOne },
                    label = { Text("Just one thing") },
                )
            }

            if (doneToday > 0) {
                Text(
                    "You already did $doneToday thing${if (doneToday == 1) "" else "s"} today ✨",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
                )
            }

            if (shown.isEmpty()) {
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
                    if (overdue.isNotEmpty()) {
                        item {
                            Text(
                                "From earlier",
                                style = MaterialTheme.typography.titleSmall,
                                color = MaterialTheme.colorScheme.tertiary,
                            )
                        }
                        items(overdue, key = { "o${it.id}" }) { todo ->
                            TaskRow(todo, repo, snackbar, onEdit, scope)
                        }
                        if (current.isNotEmpty()) {
                            item {
                                Text(
                                    "Now",
                                    style = MaterialTheme.typography.titleSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(top = 8.dp),
                                )
                            }
                        }
                    }
                    items(current, key = { it.id }) { todo ->
                        TaskRow(todo, repo, snackbar, onEdit, scope)
                    }
                    item { Spacer(Modifier.height(80.dp)) } // FAB clearance
                }
            }
        }
    }
}

@Composable
private fun TaskRow(
    todo: Todo,
    repo: TodoRepository,
    snackbar: SnackbarHostState,
    onEdit: (Long) -> Unit,
    scope: kotlinx.coroutines.CoroutineScope,
) {
    val subtasks by repo.subtasks(todo.id).collectAsState(initial = emptyList())
    TodoCard(
        todo = todo,
        subtaskProgress = if (subtasks.isEmpty()) null else subtasks.count { it.done } to subtasks.size,
        onToggle = { scope.launch {
            val wasOpen = !todo.done
            repo.setDone(todo, wasOpen)
            if (wasOpen) snackbar.showSnackbar(repo.completionMessage())
        } },
        onClick = { onEdit(todo.id) },
        onDelete = { scope.launch { repo.delete(todo) } },
    )
}

@Composable
private fun GamificationHeader(doneToday: Int, overdue: Int, totalDone: Int) {
    when (Prefs.gamification.value) {
        Prefs.Gamification.OFF, Prefs.Gamification.GENTLE -> Unit // gentle = snackbar milestones only
        Prefs.Gamification.XP -> {
            val xp = Game.xp(0, totalDone, 0)
            Column(Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(DoodleIcons.Sparkle, null, Modifier.size(18.dp), tint = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.width(6.dp))
                    Text(
                        "Level ${Game.level(xp)} · $xp XP",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.primary,
                    )
                }
                LinearProgressIndicator(
                    progress = { Game.levelProgress(xp) },
                    modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                )
            }
        }
        Prefs.Gamification.HP_BAR -> {
            val hp = Game.hp(overdue, doneToday)
            Column(Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(DoodleIcons.Heart, null, Modifier.size(18.dp), tint = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.width(6.dp))
                    Text("HP $hp / 100", style = MaterialTheme.typography.labelLarge)
                }
                LinearProgressIndicator(
                    progress = { hp / 100f },
                    color = if (hp > 60) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error,
                    modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                )
            }
        }
        Prefs.Gamification.GARDEN -> {
            Text(
                Game.garden(totalDone),
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
            )
        }
    }
}
