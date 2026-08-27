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
import de.taymaerz.foundlist.data.Priority
import de.taymaerz.foundlist.data.Recurrence
import de.taymaerz.foundlist.data.Todo
import de.taymaerz.foundlist.data.TodoRepository
import kotlinx.coroutines.launch
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditScreen(repo: TodoRepository, id: Long, onDone: () -> Unit) {
    val scope = rememberCoroutineScope()
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
                    IconButton(onClick = onDone) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") }
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
