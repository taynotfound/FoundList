<p align="center">
  <img src="assets/logo.png" width="128" alt="FoundList logo">
</p>

<h1 align="center">FoundList</h1>

<p align="center">A calm todo app for brains that need less noise, not more.</p>

FoundList is a native Android app (Kotlin + Jetpack Compose) built for ADHD and autistic users - low cognitive load, no streaks, no guilt. Just your tasks, and exactly as much game as you ask for.

## <img src="assets/icons/checkbox.svg" width="22"> Tasks

- **Today** - open tasks, soonest due first. Search, energy filters, and a "Just one thing" mode when everything is too much.
- **Subtasks** - break big scary tasks into small steps with a progress bar.
- **Priorities, categories & energy tags** - organize when it helps, skip it when it doesn't.
- **Templates** - one tap to re-add common chores.

## <img src="assets/icons/calendar.svg" width="22"> Dates that understand you

Type it like you'd say it: `next christmas`, `in 3 days`, `freitag abend`, `tomorrow 18:00`. English and German. Classic pickers still there if you prefer.

## <img src="assets/icons/bell.svg" width="22"> Reminders that actually work

- System alarms, survive reboots.
- Varied, kind notification texts - never the same nag twice.
- **Done / In 1h / Tomorrow** buttons right on the notification.
- Recurring tasks (daily, weekly, monthly) quietly schedule the next round.

## <img src="assets/icons/gamepad.svg" width="22"> Choose your own gamification

All modes are opt-in and none of them can punish you:

| Mode | What it does |
|------|-------------|
| Off | Nothing. Silence. |
| Gentle | Kind words and small milestones |
| XP & levels | Tasks give XP, levels grow slowly |
| HP bar | Overdue bites, done heals - you never die |
| Garden | Every done task grows your garden 🌱 |

## <img src="assets/icons/widget.svg" width="22"> Everywhere you are

- **Home-screen widget** with your open tasks.
- **Share text** from any app straight into a task.
- **Quick-settings tile** and long-press app shortcut for instant capture.

## <img src="assets/icons/sparkle.svg" width="22"> Looks

- **Material You** - wallpaper colors on Android 12+, plus five hand-picked palettes (calm teal, lavender, forest, sunset, mono).
- Light / dark / system, themed icon on Android 13+.
- Hand-drawn doodle icons all through the app - same pencil as the logo.

## <img src="assets/icons/heart.svg" width="22"> Your data

Everything stays on your device. No accounts, no network, no tracking. JSON export/import for backups. Streak-free statistics - numbers without guilt.

## <img src="assets/icons/flower.svg" width="22"> Tech

- Kotlin, Jetpack Compose, Material 3, Glance
- Room for storage, AlarmManager + BootReceiver for reminders
- minSdk 29 (Android 10), targetSdk 35

## Building

```
gradle assembleRelease
```

APK lands in `app/build/outputs/apk/release/`. CI builds and attaches an APK to every release.

## License

MIT
