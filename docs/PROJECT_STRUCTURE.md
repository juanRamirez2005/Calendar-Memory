# Estructura del proyecto

> ⚠️ **Archivo autogenerado por `scripts/generate-tree.js`.**
> No lo edites a mano: se regenera solo al crear archivos (hook PostToolUse)
> o al correr `npm run tree`. Excluye `node_modules`, `.git` y artefactos de build.

```
CalendarMemory/
├── __tests__/
│   ├── features/
│   │   ├── semesters.test.ts
│   │   ├── subjects.test.ts
│   │   └── tasks.test.ts
│   └── App.test.tsx
├── .bundle/
│   └── config
├── .claude/
│   ├── skills/
│   │   ├── react/
│   │   │   └── SKILL.md
│   │   └── react-native/
│   │       └── SKILL.md
│   ├── settings.json
│   └── settings.local.json
├── android/
│   ├── .kotlin/
│   │   └── sessions/
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/
│   │   │       │   └── com/
│   │   │       │       └── calendarmemory/
│   │   │       │           ├── MainActivity.kt
│   │   │       │           └── MainApplication.kt
│   │   │       ├── res/
│   │   │       │   ├── drawable/
│   │   │       │   │   └── rn_edit_text_material.xml
│   │   │       │   ├── mipmap-hdpi/
│   │   │       │   │   ├── ic_launcher_round.png
│   │   │       │   │   └── ic_launcher.png
│   │   │       │   ├── mipmap-mdpi/
│   │   │       │   │   ├── ic_launcher_round.png
│   │   │       │   │   └── ic_launcher.png
│   │   │       │   ├── mipmap-xhdpi/
│   │   │       │   │   ├── ic_launcher_round.png
│   │   │       │   │   └── ic_launcher.png
│   │   │       │   ├── mipmap-xxhdpi/
│   │   │       │   │   ├── ic_launcher_round.png
│   │   │       │   │   └── ic_launcher.png
│   │   │       │   ├── mipmap-xxxhdpi/
│   │   │       │   │   ├── ic_launcher_round.png
│   │   │       │   │   └── ic_launcher.png
│   │   │       │   └── values/
│   │   │       │       ├── strings.xml
│   │   │       │       └── styles.xml
│   │   │       └── AndroidManifest.xml
│   │   ├── build.gradle
│   │   ├── debug.keystore
│   │   └── proguard-rules.pro
│   ├── gradle/
│   │   └── wrapper/
│   │       ├── gradle-wrapper.jar
│   │       └── gradle-wrapper.properties
│   ├── build.gradle
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   ├── local.properties
│   └── settings.gradle
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PROJECT_STRUCTURE.md
│   └── REQUIREMENTS.md
├── scripts/
│   └── generate-tree.js
├── src/
│   ├── app/
│   │   ├── navigation/
│   │   │   ├── MainTabs.tsx
│   │   │   ├── RootNavigator.tsx
│   │   │   └── types.ts
│   │   ├── providers/
│   │   │   └── index.tsx
│   │   ├── store/
│   │   └── App.tsx
│   ├── assets/
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   ├── core/
│   │   ├── api/
│   │   ├── config/
│   │   │   └── preferences.ts
│   │   ├── di/
│   │   │   └── container.ts
│   │   ├── errors/
│   │   │   ├── AppError.ts
│   │   │   └── result.ts
│   │   └── storage/
│   │       ├── migrations/
│   │       │   └── index.ts
│   │       ├── database.ts
│   │       ├── keyValue.ts
│   │       ├── SqliteDatabase.ts
│   │       └── SqliteKeyValueStore.ts
│   ├── features/
│   │   ├── calendar/
│   │   │   └── presentation/
│   │   │       ├── components/
│   │   │       │   └── MonthCalendar.tsx
│   │   │       └── screens/
│   │   │           └── CalendarScreen.tsx
│   │   ├── semesters/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── SemesterDataSource.ts
│   │   │   │   │   └── SqliteSemesterDataSource.ts
│   │   │   │   ├── dto/
│   │   │   │   │   └── SemesterRow.ts
│   │   │   │   ├── mappers/
│   │   │   │   │   └── semesterMapper.ts
│   │   │   │   └── repositories/
│   │   │   │       └── SemesterRepositoryImpl.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── Semester.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   └── SemesterRepository.ts
│   │   │   │   └── usecases/
│   │   │   │       └── semesterUseCases.ts
│   │   │   └── presentation/
│   │   │       ├── screens/
│   │   │       │   ├── SemesterFormScreen.tsx
│   │   │       │   └── SemestersScreen.tsx
│   │   │       └── store/
│   │   │           └── semestersStore.ts
│   │   ├── settings/
│   │   │   └── presentation/
│   │   │       └── screens/
│   │   │           └── SettingsScreen.tsx
│   │   ├── subjects/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── SqliteSubjectDataSource.ts
│   │   │   │   │   └── SubjectDataSource.ts
│   │   │   │   ├── dto/
│   │   │   │   │   └── SubjectRow.ts
│   │   │   │   ├── mappers/
│   │   │   │   │   └── subjectMapper.ts
│   │   │   │   └── repositories/
│   │   │   │       └── SubjectRepositoryImpl.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── Subject.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   └── SubjectRepository.ts
│   │   │   │   └── usecases/
│   │   │   │       └── subjectUseCases.ts
│   │   │   └── presentation/
│   │   │       ├── screens/
│   │   │       │   ├── SubjectDetailScreen.tsx
│   │   │       │   ├── SubjectFormScreen.tsx
│   │   │       │   └── SubjectsScreen.tsx
│   │   │       └── store/
│   │   │           └── subjectsStore.ts
│   │   └── tasks/
│   │       ├── data/
│   │       │   ├── datasources/
│   │       │   │   ├── SqliteTaskDataSource.ts
│   │       │   │   └── TaskDataSource.ts
│   │       │   ├── dto/
│   │       │   │   └── TaskRow.ts
│   │       │   ├── mappers/
│   │       │   │   └── taskMapper.ts
│   │       │   └── repositories/
│   │       │       └── TaskRepositoryImpl.ts
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   └── Task.ts
│   │       │   ├── repositories/
│   │       │   │   └── TaskRepository.ts
│   │       │   └── usecases/
│   │       │       └── taskUseCases.ts
│   │       └── presentation/
│   │           ├── components/
│   │           │   └── TaskListItem.tsx
│   │           ├── screens/
│   │           │   ├── TaskDetailScreen.tsx
│   │           │   ├── TaskFormScreen.tsx
│   │           │   └── TasksScreen.tsx
│   │           ├── store/
│   │           │   └── tasksStore.ts
│   │           └── taskLabels.ts
│   ├── shared/
│   │   ├── constants/
│   │   ├── hooks/
│   │   │   └── useActiveSemester.ts
│   │   ├── types/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── index.ts
│   │   │   ├── Pill.tsx
│   │   │   ├── Screen.tsx
│   │   │   ├── ScreenHeader.tsx
│   │   │   └── TextField.tsx
│   │   └── utils/
│   │       ├── date.ts
│   │       └── id.ts
│   └── theme/
│       ├── index.ts
│       └── ThemeContext.tsx
├── .eslintrc.js
├── .gitignore
├── .prettierrc.js
├── .watchmanconfig
├── app.json
├── babel.config.js
├── Gemfile
├── index.js
├── jest.config.js
├── jest.setup.js
├── metro.config.js
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```
