# Estructura del proyecto

> ⚠️ **Archivo autogenerado por `scripts/generate-tree.js`.**
> No lo edites a mano: se regenera solo al crear archivos (hook PostToolUse)
> o al correr `npm run tree`. Excluye `node_modules`, `.git` y artefactos de build.

```
CalendarMemory/
├── __tests__/
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
│   │   │   └── RootNavigator.tsx
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
│   │   ├── di/
│   │   ├── errors/
│   │   └── storage/
│   ├── features/
│   ├── shared/
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── ui/
│   │   └── utils/
│   └── theme/
├── .eslintrc.js
├── .gitignore
├── .prettierrc.js
├── .watchmanconfig
├── app.json
├── babel.config.js
├── Gemfile
├── index.js
├── jest.config.js
├── metro.config.js
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```
