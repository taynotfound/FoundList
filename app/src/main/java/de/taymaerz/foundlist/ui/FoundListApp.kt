package de.taymaerz.foundlist.ui

import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.compose.*
import androidx.navigation.NavGraph.Companion.findStartDestination
import de.taymaerz.foundlist.FoundListApp
import de.taymaerz.foundlist.ui.screens.EditScreen
import de.taymaerz.foundlist.ui.screens.HistoryScreen
import de.taymaerz.foundlist.ui.screens.SettingsScreen
import de.taymaerz.foundlist.ui.screens.StatsScreen
import de.taymaerz.foundlist.ui.screens.TodayScreen
import de.taymaerz.foundlist.ui.theme.DoodleIcons

@Composable
fun FoundListApp(startNewTask: Boolean = false) {
    val nav = rememberNavController()
    val repo = (LocalContext.current.applicationContext as FoundListApp).repository
    val backStack by nav.currentBackStackEntryAsState()
    val route = backStack?.destination?.route

    LaunchedEffect(startNewTask) {
        if (startNewTask) nav.navigate("edit/0")
    }

    val tabs = listOf(
        Triple("today", "Today", DoodleIcons.List),
        Triple("history", "History", DoodleIcons.History),
        Triple("settings", "Settings", DoodleIcons.Settings),
    )

    Scaffold(
        bottomBar = {
            if (route in tabs.map { it.first }) {
                NavigationBar {
                    tabs.forEach { (dest, label, icon) ->
                        NavigationBarItem(
                            selected = route == dest,
                            onClick = {
                                nav.navigate(dest) {
                                    popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(icon, label) },
                            label = { Text(label) },
                        )
                    }
                }
            }
        }
    ) { padding ->
        NavHost(nav, startDestination = "today") {
            composable("today") { TodayScreen(repo, padding, onEdit = { nav.navigate("edit/$it") }) }
            composable("history") { HistoryScreen(repo, padding) }
            composable("settings") { SettingsScreen(repo, padding, onStats = { nav.navigate("stats") }) }
            composable("stats") { StatsScreen(repo, onBack = { nav.popBackStack() }) }
            composable("edit/{id}") { entry ->
                val id = entry.arguments?.getString("id")?.toLongOrNull() ?: 0L
                EditScreen(repo, id, onDone = { nav.popBackStack() })
            }
        }
    }
}
