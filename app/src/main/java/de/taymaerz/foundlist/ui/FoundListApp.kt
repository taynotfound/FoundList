package de.taymaerz.foundlist.ui

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.automirrored.outlined.List
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.compose.*
import androidx.navigation.NavGraph.Companion.findStartDestination
import de.taymaerz.foundlist.FoundListApp
import de.taymaerz.foundlist.ui.screens.EditScreen
import de.taymaerz.foundlist.ui.screens.HistoryScreen
import de.taymaerz.foundlist.ui.screens.SettingsScreen
import de.taymaerz.foundlist.ui.screens.TodayScreen

@Composable
fun FoundListApp() {
    val nav = rememberNavController()
    val repo = (LocalContext.current.applicationContext as FoundListApp).repository
    val backStack by nav.currentBackStackEntryAsState()
    val route = backStack?.destination?.route

    val tabs = listOf(
        Triple("today", "Today", Icons.AutoMirrored.Outlined.List to Icons.AutoMirrored.Filled.List),
        Triple("history", "History", Icons.Outlined.History to Icons.Filled.History),
        Triple("settings", "Settings", Icons.Outlined.Settings to Icons.Filled.Settings),
    )

    Scaffold(
        bottomBar = {
            if (route in tabs.map { it.first }) {
                NavigationBar {
                    tabs.forEach { (dest, label, icons) ->
                        val selected = route == dest
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                nav.navigate(dest) {
                                    popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(if (selected) icons.second else icons.first, label) },
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
            composable("settings") { SettingsScreen(repo, padding) }
            composable("edit/{id}") { entry ->
                val id = entry.arguments?.getString("id")?.toLongOrNull() ?: 0L
                EditScreen(repo, id, onDone = { nav.popBackStack() })
            }
        }
    }
}
