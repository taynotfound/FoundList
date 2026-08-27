package de.taymaerz.foundlist.ui.screens

import android.content.Intent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import de.taymaerz.foundlist.data.TodoRepository
import de.taymaerz.foundlist.ui.theme.DoodleIcons
import de.taymaerz.foundlist.util.Prefs
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(repo: TodoRepository, outerPadding: PaddingValues, onStats: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val exportLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.CreateDocument("application/json")
    ) { uri ->
        uri?.let {
            scope.launch {
                context.contentResolver.openOutputStream(it)?.use { out ->
                    out.write(repo.exportJson().toByteArray())
                }
                android.widget.Toast.makeText(context, "Exported ✔", android.widget.Toast.LENGTH_SHORT).show()
            }
        }
    }
    val importLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument()
    ) { uri ->
        uri?.let {
            scope.launch {
                val json = context.contentResolver.openInputStream(it)?.use { s -> s.readBytes().decodeToString() }
                val n = json?.let { j -> runCatching { repo.importJson(j) }.getOrNull() }
                android.widget.Toast.makeText(
                    context,
                    if (n != null) "Imported $n tasks ✔" else "Couldn't read that file",
                    android.widget.Toast.LENGTH_SHORT,
                ).show()
            }
        }
    }

    Scaffold(
        modifier = Modifier.padding(bottom = outerPadding.calculateBottomPadding()),
        topBar = { TopAppBar(title = { Text("Settings") }) },
    ) { padding ->
        Column(
            Modifier.padding(padding).padding(horizontal = 16.dp).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text("Appearance", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)

            Text("Theme", style = MaterialTheme.typography.labelLarge)
            SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                Prefs.ThemeMode.entries.forEachIndexed { i, m ->
                    SegmentedButton(
                        selected = Prefs.themeMode.value == m,
                        onClick = { Prefs.themeMode.value = m; Prefs.save(context) },
                        shape = SegmentedButtonDefaults.itemShape(i, Prefs.ThemeMode.entries.size),
                    ) { Text(m.name.lowercase().replaceFirstChar { it.uppercase() }) }
                }
            }

            Text("Colors", style = MaterialTheme.typography.labelLarge)
            Prefs.Palette.entries.forEach { p ->
                Row(
                    Modifier.fillMaxWidth().clickable { Prefs.palette.value = p; Prefs.save(context) }.padding(vertical = 4.dp),
                    verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                ) {
                    RadioButton(selected = Prefs.palette.value == p, onClick = { Prefs.palette.value = p; Prefs.save(context) })
                    Text(
                        when (p) {
                            Prefs.Palette.DYNAMIC -> "Match wallpaper (Android 12+)"
                            Prefs.Palette.TEAL -> "Calm teal"
                            Prefs.Palette.LAVENDER -> "Lavender"
                            Prefs.Palette.FOREST -> "Forest"
                            Prefs.Palette.SUNSET -> "Sunset"
                            Prefs.Palette.MONO -> "Monochrome"
                        }
                    )
                }
            }

            HorizontalDivider(Modifier.padding(vertical = 8.dp))
            Row(
                Modifier.fillMaxWidth().clickable {
                    Prefs.handwritingFont.value = !Prefs.handwritingFont.value; Prefs.save(context)
                },
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text("Handwriting font", style = MaterialTheme.typography.bodyLarge)
                    Text(
                        "The whole app in a hand-drawn script",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Switch(
                    checked = Prefs.handwritingFont.value,
                    onCheckedChange = { Prefs.handwritingFont.value = it; Prefs.save(context) },
                )
            }

            HorizontalDivider(Modifier.padding(vertical = 8.dp))
            Text("Gamification", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
            Text(
                "Choose how much game you want. Nothing ever punishes you.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Prefs.Gamification.entries.forEach { g ->
                Row(
                    Modifier.fillMaxWidth().clickable { Prefs.gamification.value = g; Prefs.save(context) }.padding(vertical = 4.dp),
                    verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                ) {
                    RadioButton(selected = Prefs.gamification.value == g, onClick = { Prefs.gamification.value = g; Prefs.save(context) })
                    Column {
                        Text(
                            when (g) {
                                Prefs.Gamification.OFF -> "Off"
                                Prefs.Gamification.GENTLE -> "Gentle"
                                Prefs.Gamification.XP -> "XP & levels"
                                Prefs.Gamification.HP_BAR -> "HP bar"
                                Prefs.Gamification.GARDEN -> "Garden"
                            }
                        )
                        Text(
                            when (g) {
                                Prefs.Gamification.OFF -> "No game elements at all"
                                Prefs.Gamification.GENTLE -> "Kind words and small milestones"
                                Prefs.Gamification.XP -> "Tasks give XP, levels grow slowly"
                                Prefs.Gamification.HP_BAR -> "Overdue bites, done heals - never dies"
                                Prefs.Gamification.GARDEN -> "Each done task grows your garden"
                            },
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }

            HorizontalDivider(Modifier.padding(vertical = 8.dp))
            Text("Data", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)

            SettingsRow(icon = { Icon(DoodleIcons.Stats, null) }, title = "Statistics", onClick = onStats)
            SettingsRow(icon = { Icon(DoodleIcons.Save, null) }, title = "Export backup (JSON)", onClick = {
                exportLauncher.launch("foundlist-backup.json")
            })
            SettingsRow(icon = { Icon(DoodleIcons.Import, null) }, title = "Import backup", onClick = {
                importLauncher.launch(arrayOf("application/json", "text/plain", "*/*"))
            })
            SettingsRow(icon = { Icon(DoodleIcons.Sweep, null) }, title = "Clear completed tasks", onClick = {
                scope.launch { repo.clearCompleted() }
            })
            SettingsRow(icon = { Icon(DoodleIcons.Bell, null) }, title = "Notification settings", onClick = {
                context.startActivity(
                    Intent(android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                        .putExtra(android.provider.Settings.EXTRA_APP_PACKAGE, context.packageName)
                )
            })
            SettingsRow(icon = { Icon(DoodleIcons.Code, null) }, title = "Source code", onClick = {
                context.startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse("https://github.com/taynotfound/FoundList")))
            })

            Text(
                "FoundList 3.1 · made with ♥ for brains that wander",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(vertical = 16.dp),
            )
        }
    }
}

@Composable
private fun SettingsRow(icon: @Composable () -> Unit, title: String, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clickable(onClick = onClick).padding(vertical = 12.dp),
        verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        icon()
        Text(title, style = MaterialTheme.typography.bodyLarge)
    }
}
