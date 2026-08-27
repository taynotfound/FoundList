# FoundList

<p align="center">
  <img src="assets/iconbg.svg" alt="FoundList logo" width="128">
</p>

<p align="center"><strong>A calm, practical todo list for remembering what matters.</strong></p>

FoundList is designed for low cognitive load. It keeps the useful parts of task management - reminders, recurring tasks, priorities, categories, search, calendar, and a simple progress view - without points, streaks, levels, or pressure to perform.

## What it does

- Add tasks with descriptions, due dates, reminders, recurrence, priorities, categories, tags, and photos.
- Complete tasks with one tap and restore them when needed.
- Find tasks quickly with search and sort by what matters.
- Review upcoming work in the calendar and completed work in history.
- Choose light, dark, or automatic appearance with calm Material You-inspired color roles.
- Works on Android 10 (API 29) and newer.

## Download

Open [Releases](https://github.com/taynotfound/FoundList/releases) and download the APK attached to the latest release. Android may ask you to allow installation from your browser or file manager.

Preview APKs are also available in the [Android APK workflow](https://github.com/taynotfound/FoundList/actions/workflows/android-apk.yml) artifacts.

## Development

Requirements: Node.js 24, npm, and an Expo account for EAS builds.

```bash
git clone https://github.com/taynotfound/FoundList.git
cd FoundList
npm ci
npm start
```

Press `w` for the web preview, or use an Android emulator/device with Expo Go. The project targets Expo SDK 54 and React Native 0.81.

### Build an APK

```bash
npx eas build --platform android --profile preview
```

The GitHub Action builds a preview APK on every push. Run it manually with `release` enabled to publish the APK as a GitHub release with generated changelog notes. It requires the repository secret `EXPO_TOKEN`; never put that token in source files or commit it.

## Design

FoundList uses Material You-inspired roles rather than a third-party UI framework: primary, on-primary, container, surface, outline, and error colors; generous touch targets; readable type; visible focus/selection states; and restrained elevation. On Android 12+ the accent follows your wallpaper (dynamic color, toggleable in Settings); Android 10/11, iOS, and web use the calm static palette.

## Project checks

```bash
npm ci
npx expo export --platform web
git diff --check
```

## Contributing

Keep changes small, accessible, and focused on remembering and completing tasks. Avoid adding game mechanics or visual noise to the primary flow.

## License

MIT - see [LICENSE](LICENSE).
