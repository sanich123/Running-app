# Contributing to Runich

Спасибо за вклад в Runich. Перед началом работы настройте локальную среду по инструкции в [README.md](./README.md).

## Prerequisites

- Node.js, совместимый с текущей версией Expo SDK
- Corepack и Yarn
- Android Studio и Android SDK для Android-разработки
- Xcode и CocoaPods для iOS-разработки
- Доступ к EAS-проекту, если нужны native-сборки или updates

## Set up the project

Установите зависимости из директории проекта:

```bash
corepack enable
yarn install
```

Запускайте Expo:

```bash
yarn dev
```

Локальные `.env`-файлы используются только для конфигурации окружения. Не добавляйте в Git пароли, токены, signing-файлы, `sk...` Mapbox token или другие секреты.

## Development workflow

Если maintainer не указал иное:

1. Создайте focused branch от актуальной рабочей ветки проекта.
2. Делайте одну логически завершённую задачу в ветке.
3. Добавляйте или обновляйте тесты для изменённого поведения.
4. Обновляйте документацию и `CHANGELOG.md`, если изменение заметно пользователю.
5. Запустите обязательные проверки.
6. Откройте pull request в согласованную ветку интеграции.

Не смешивайте функциональные изменения, рефакторинг, форматирование и обновление зависимостей без необходимости. Сохраняйте существующие незавершённые изменения и не переписывайте чужую историю.

## Project conventions

- Оставляйте файлы в `app/` тонкими: маршрутизация и композиция экранов.
- Поведение feature-экранов размещайте в `routes/`.
- Переиспользуемые компоненты размещайте в `shared/`.
- API-запросы размещайте в `redux/services/`.
- Клиентское состояние размещайте в `redux/slices/`.
- Используйте алиасы из `tsconfig.json`.
- Сохраняйте строгую TypeScript-типизацию и существующие соглашения соседней feature.
- Для отдельных страниц явно обрабатывайте состояния loading, success и error.
- Ошибки важных асинхронных операций показывайте пользователю через существующие toast-компоненты.
- Не добавляйте `console.log` и debugger statements.
- Новые визуальные компоненты оформляйте через текущие theme tokens и размеры проекта.
- При изменении маршрутов, permissions, deep links или native-конфигурации добавляйте описание ручной проверки.

Форматирование контролируется `.prettierrc`. Используйте существующие настройки проекта вместо ручного выравнивания.

## Dependencies and native configuration

Для Expo и React Native-пакетов используйте совместимый с SDK установщик:

```bash
npx expo install <package>
```

Для остальных зависимостей используйте Yarn:

```bash
yarn add <package>
yarn add --dev <package>
```

Для выравнивания Expo-зависимостей по SDK используйте `yarn expo:fix`. Команда запускает `expo install --fix` и проверяет, что локальные патчи сохранились. Версию пакета держите в `dependencies`, а Yarn-дескриптор патча — в `resolutions`. После обновления patched-пакета перенесите патч на новую версию, обновите `resolutions` и запустите `yarn patches:check`. CI также проверяет Expo-совместимость и immutable lockfile.

Чтобы перенести патч на новую версию, откройте исходники пакета, повторно применив старый патч, разрешите возможные конфликты и сохраните результат:

```sh
yarn patch <package>@npm:<new-version> --update
yarn patch-commit -s <temporary-directory>
yarn install
yarn patches:check
```

При изменении native-зависимости:

1. Обновите `app.config.ts`, если нужен plugin, permission или deep link.
2. Перегенерируйте native-проекты командой `yarn prebuild:clean`, если это безопасно.
3. Проверьте Android и iOS.
4. Проверьте web export или добавьте явный web fallback.

Команда `yarn prebuild:clean` пересоздаёт `android/` и `ios/`. Не запускайте её при наличии незакоммиченных ручных изменений в этих директориях.

## Tests

Тесты используют Jest, React Native Testing Library и MSW. Размещайте focused tests рядом с реализацией с суффиксом `.test.ts` или `.test.tsx`. Общие handlers, fixtures и test utilities размещайте в `tests/`.

```bash
yarn test
yarn test path/to/file.test.tsx
yarn test:debug path/to/file.test.tsx
```

Тесты должны проверять пользовательское поведение и relevant failure states. Для исправлений добавляйте regression test, если поведение можно надёжно проверить автоматически.

## Required checks

Перед pull request запустите:

```bash
yarn tsc --noEmit
yarn eslint .
yarn test
git diff --check
```

Для изменений, связанных с платформой, дополнительно запускайте затронутую цель:

```bash
yarn android
yarn ios
yarn web:export:stage
```

Если платформу невозможно проверить локально, укажите это в описании pull request. Для визуальных изменений приложите скриншоты или короткую запись экрана.

## Commit messages

Используйте короткий imperative subject с conventional type:

```text
feat: add activity feedback form
fix: preserve activity after upload failure
test: cover logout navigation
docs: update local development guide
deps: update Expo-compatible packages
```

Основные типы: `feat`, `fix`, `refactor`, `test`, `docs`, `deps`, `ci`. Форматирование и функциональные изменения по возможности разделяйте.

## Changelog and versioning

Пользовательские изменения добавляйте в раздел `Unreleased` файла [CHANGELOG.md](./CHANGELOG.md), используя категории `Added`, `Changed`, `Fixed`, `Removed` и `Security`.

Не создавайте release-раздел и не меняйте версию приложения без задачи на подготовку релиза. При релизе синхронизируйте версию в `package.json` и `app.config.ts`, используйте Semantic Versioning и добавляйте дату в формате `YYYY-MM-DD`.

## Pull request checklist

Перед запросом review проверьте:

- изменение имеет понятную цель и не содержит unrelated edits;
- TypeScript, ESLint, тесты и `git diff --check` проходят;
- новое поведение и исправления покрыты тестами;
- учтено влияние на Android, iOS и web;
- native permissions и конфигурация описаны;
- пользовательские изменения добавлены в `Unreleased`;
- для UI-изменений приложены screenshots или video;
- указаны непроверенные платформы, известные ограничения и follow-up work.
