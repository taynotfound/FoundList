package de.taymaerz.foundlist.ui.screens

import android.text.format.DateFormat
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import de.taymaerz.foundlist.data.Energy
import de.taymaerz.foundlist.data.Priority
import de.taymaerz.foundlist.data.Recurrence
import de.taymaerz.foundlist.data.Subtask
import de.taymaerz.foundlist.data.Template
import de.taymaerz.foundlist.data.Todo
import de.taymaerz.foundlist.data.TodoRepository
import de.taymaerz.foundlist.ui.theme.DoodleIcons
import kotlinx.coroutines.launch
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditScreen(repo: TodoRepository, id: Long, onDone: () -> Unit) {
    val scope = rememberCoroutineScope()
    val context = androidx.compose.ui.platform.LocalContext.current
    var loaded by remember { mutableStateOf(id == 0L) }
    var todo by remember { mutableStateOf(Todo(title = "")) }

    LaunchedEffect(id) {
        if (id != 0L) repo.byId(id)?.let { todo = it }
        loaded = true
    }

    var showDatePicker by remember { mutableStateOf(false) }
    var showTimePicker by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (id == 0L) "New task" else "Edit task") },
                navigationIcon = {
                    IconButton(onClick = onDone) { Icon(DoodleIcons.Back, "Back") }
                },
            )
        },
        bottomBar = {
            Button(
                onClick = { scope.launch { repo.save(todo); onDone() } },
                enabled = todo.title.isNotBlank(),
                modifier = Modifier.fillMaxWidth().padding(16.dp),
            ) { Text("Save") }
        },
    ) { padding ->
        if (!loaded) return@Scaffold
        Column(
            Modifier.padding(padding).padding(horizontal = 16.dp).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            OutlinedTextField(
                value = todo.title,
                onValueChange = { todo = todo.copy(title = it) },
                label = { Text("Title") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = todo.notes,
                onValueChange = { todo = todo.copy(notes = it) },
                label = { Text("Notes") },
                minLines = 2,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = todo.category,
                onValueChange = { todo = todo.copy(category = it) },
                label = { Text("Category") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            Text("Priority", style = MaterialTheme.typography.labelLarge)
            SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                Priority.entries.forEachIndexed { i, p ->
                    SegmentedButton(
                        selected = todo.priority == p,
                        onClick = { todo = todo.copy(priority = p) },
                        shape = SegmentedButtonDefaults.itemShape(i, Priority.entries.size),
                    ) { Text(p.name.lowercase().replaceFirstChar { it.uppercase() }) }
                }
            }

            Text("Energy needed", style = MaterialTheme.typography.labelLarge)
            SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                Energy.entries.forEachIndexed { i, e ->
                    SegmentedButton(
                        selected = todo.energy == e,
                        onClick = { todo = todo.copy(energy = e) },
                        shape = SegmentedButtonDefaults.itemShape(i, Energy.entries.size),
                    ) { Text(e.name.lowercase().replaceFirstChar { it.uppercase() }) }
                }
            }

            Text("Repeats", style = MaterialTheme.typography.labelLarge)
            SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                Recurrence.entries.forEachIndexed { i, r ->
                    SegmentedButton(
                        selected = todo.recurrence == r,
                        onClick = { todo = todo.copy(recurrence = r) },
                        shape = SegmentedButtonDefaults.itemShape(i, Recurrence.entries.size),
                    ) { Text(r.name.lowercase().replaceFirstChar { it.uppercase() }) }
                }
            }

            // smart date: type "next christmas", "in 3 days", "freitag"...
            var smartText by remember { mutableStateOf("") }
            val smartParsed = remember(smartText) { de.taymaerz.foundlist.util.SmartDate.parse(smartText) }
            OutlinedTextField(
                value = smartText,
                onValueChange = { smartText = it },
                label = { Text("Due (type it: \"next christmas\", \"in 3 days\", \"freitag\"…)") },
                singleLine = true,
                supportingText = smartParsed?.let {
                    { Text("→ " + DateFormat.format("EEE, dd MMM yyyy", it)) }
                },
                trailingIcon = smartParsed?.let {
                    {
                        TextButton(onClick = {
                            todo = todo.copy(dueAt = it)
                            smartText = ""
                        }) { Text("Set") }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            )

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick = { showDatePicker = true }, Modifier.weight(1f)) {
                    Text(todo.dueAt?.let { DateFormat.getDateFormat(androidx.compose.ui.platform.LocalContext.current.let { c -> c }).format(it) } ?: "Due date")
                }
                OutlinedButton(onClick = { showTimePicker = true }, Modifier.weight(1f), enabled = todo.dueAt != null) {
                    Text(todo.reminderAt?.let { DateFormat.format("HH:mm", it).toString() } ?: "Reminder")
                }
            }
            if (todo.dueAt != null) {
                TextButton(onClick = { todo = todo.copy(dueAt = null, reminderAt = null) }) { Text("Clear date & reminder") }
            }

            // --- subtasks (existing tasks only; new tasks: save first) ---
            if (id != 0L) {
                val subtasks by repo.subtasks(id).collectAsState(initial = emptyList())
                var newSub by remember { mutableStateOf("") }
                Text("Steps", style = MaterialTheme.typography.labelLarge)
                subtasks.forEach { s ->
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        Checkbox(checked = s.done, onCheckedChange = { c ->
                            scope.launch { repo.upsertSubtask(s.copy(done = c)) }
                        })
                        Text(
                            s.title, Modifier.weight(1f),
                            style = MaterialTheme.typography.bodyMedium,
                            textDecoration = if (s.done) androidx.compose.ui.text.style.TextDecoration.LineThrough else null,
                        )
                        IconButton(onClick = { scope.launch { repo.deleteSubtask(s) } }) {
                            Icon(DoodleIcons.Delete, "Remove step", Modifier.size(18.dp))
                        }
                    }
                }
                OutlinedTextField(
                    value = newSub,
                    onValueChange = { newSub = it },
                    label = { Text("Add a small step") },
                    singleLine = true,
                    trailingIcon = {
                        if (newSub.isNotBlank()) TextButton(onClick = {
                            scope.launch {
                                repo.upsertSubtask(Subtask(todoId = id, title = newSub.trim(), position = subtasks.size))
                                newSub = ""
                            }
                        }) { Text("Add") }
                    },
                    modifier = Modifier.fillMaxWidth(),
                )

                // --- focus timer ---
                var focusLeft by remember { mutableStateOf(0) } // seconds
                LaunchedEffect(focusLeft > 0) {
                    while (focusLeft > 0) {
                        kotlinx.coroutines.delay(1000)
                        focusLeft--
                        if (focusLeft == 0) android.widget.Toast.makeText(
                            context, "Focus time done. Nice work ✨", android.widget.Toast.LENGTH_LONG
                        ).show()
                    }
                }
                Text("Focus on this", style = MaterialTheme.typography.labelLarge)
                if (focusLeft > 0) {
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(DoodleIcons.Timer, null, Modifier.size(18.dp), tint = MaterialTheme.colorScheme.primary)
                        Text("%d:%02d left".format(focusLeft / 60, focusLeft % 60), style = MaterialTheme.typography.titleMedium)
                        TextButton(onClick = { focusLeft = 0 }) { Text("Stop") }
                    }
                } else {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(5, 10, 25).forEach { m ->
                            OutlinedButton(onClick = { focusLeft = m * 60 }) { Text("$m min") }
                        }
                    }
                }
            } else {
                Text(
                    "Save the task first to add small steps.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }

            // --- templates ---
            val templates by repo.templates.collectAsState(initial = emptyList())
            if (templates.isNotEmpty() && id == 0L) {
                Text("From template", style = MaterialTheme.typography.labelLarge)
                templates.forEach { t ->
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        TextButton(onClick = {
                            todo = todo.copy(title = t.title, category = t.category, priority = t.priority, energy = t.energy, recurrence = t.recurrence)
                        }, Modifier.weight(1f)) { Text(t.title, maxLines = 1) }
                        IconButton(onClick = { scope.launch { repo.deleteTemplate(t) } }) {
                            Icon(DoodleIcons.Delete, "Delete template", Modifier.size(16.dp))
                        }
                    }
                }
            }
            if (todo.title.isNotBlank()) {
                TextButton(onClick = { scope.launch {
                    repo.upsertTemplate(Template(title = todo.title, category = todo.category, priority = todo.priority, energy = todo.energy, recurrence = todo.recurrence))
                    android.widget.Toast.makeText(context, "Saved as template", android.widget.Toast.LENGTH_SHORT).show()
                } }) { Text("Save as template") }
            }
            Spacer(Modifier.height(24.dp))
        }
    }

    if (showDatePicker) {
        val state = rememberDatePickerState(initialSelectedDateMillis = todo.dueAt)
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    todo = todo.copy(dueAt = state.selectedDateMillis)
                    showDatePicker = false
                }) { Text("OK") }
            },
            dismissButton = { TextButton(onClick = { showDatePicker = false }) { Text("Cancel") } },
        ) { DatePicker(state) }
    }

    if (showTimePicker) {
        val cal = Calendar.getInstance().apply { timeInMillis = todo.reminderAt ?: todo.dueAt ?: timeInMillis }
        val state = rememberTimePickerState(cal.get(Calendar.HOUR_OF_DAY), cal.get(Calendar.MINUTE), true)
        AlertDialog(
            onDismissRequest = { showTimePicker = false },
            title = { Text("Reminder time") },
            text = { TimePicker(state) },
            confirmButton = {
                TextButton(onClick = {
                    val base = Calendar.getInstance().apply {
                        timeInMillis = todo.dueAt ?: System.currentTimeMillis()
                        set(Calendar.HOUR_OF_DAY, state.hour)
                        set(Calendar.MINUTE, state.minute)
                        set(Calendar.SECOND, 0)
                    }
                    todo = todo.copy(reminderAt = base.timeInMillis)
                    showTimePicker = false
                }) { Text("OK") }
            },
            dismissButton = { TextButton(onClick = { showTimePicker = false }) { Text("Cancel") } },
        )
    }
}
