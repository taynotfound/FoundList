package de.taymaerz.foundlist.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import de.taymaerz.foundlist.data.TodoRepository
import de.taymaerz.foundlist.ui.theme.DoodleIcons
import java.util.Calendar

/** Streak-free stats: totals and a weekday bar chart. Numbers, no guilt. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatsScreen(repo: TodoRepository, onBack: () -> Unit) {
    val completed by repo.completed.collectAsState(initial = emptyList())
    val open by repo.open.collectAsState(initial = emptyList())

    val byWeekday = IntArray(7)
    completed.forEach { t ->
        t.doneAt?.let {
            val dow = Calendar.getInstance().apply { timeInMillis = it }.get(Calendar.DAY_OF_WEEK)
            byWeekday[(dow + 5) % 7]++ // Mon=0
        }
    }
    val max = byWeekday.max().coerceAtLeast(1)
    val days = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")

    val byCategory = completed.groupingBy { it.category.ifBlank { "(none)" } }.eachCount()
        .entries.sortedByDescending { it.value }.take(6)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Statistics") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(DoodleIcons.Back, "Back") } },
            )
        },
    ) { padding ->
        Column(
            Modifier.padding(padding).padding(16.dp).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard("Done", completed.size.toString(), Modifier.weight(1f))
                StatCard("Open", open.size.toString(), Modifier.weight(1f))
            }

            Text("By weekday", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
            days.forEachIndexed { i, d ->
                Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                    Text(d, Modifier.width(44.dp), style = MaterialTheme.typography.labelMedium)
                    LinearProgressIndicator(
                        progress = { byWeekday[i].toFloat() / max },
                        modifier = Modifier.weight(1f).height(8.dp),
                    )
                    Text(
                        "  ${byWeekday[i]}",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            if (byCategory.isNotEmpty()) {
                Text("By category", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                byCategory.forEach { (cat, n) ->
                    Row {
                        Text(cat, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                        Text("$n", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Composable
private fun StatCard(label: String, value: String, modifier: Modifier = Modifier) {
    Card(modifier) {
        Column(Modifier.padding(16.dp)) {
            Text(value, style = MaterialTheme.typography.headlineMedium, color = MaterialTheme.colorScheme.primary)
            Text(label, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
