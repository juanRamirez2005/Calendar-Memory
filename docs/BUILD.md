# Compilar e instalar en el teléfono

App solo Android (no hay proyecto iOS). `applicationId`: `com.calendarmemory`, `minSdk` 24.

## Arquitecturas

`android/gradle.properties` compila `arm64-v8a,x86_64`: el primero cubre cualquier
teléfono moderno, el segundo el emulador de Windows. Cada arquitectura extra
duplica el tiempo de compilación nativa (op-sqlite y notifee traen C++), así que
se omiten `armeabi-v7a` y `x86`. Para un teléfono viejo de 32 bits:

```powershell
cd android
.\gradlew.bat assembleRelease "-PreactNativeArchitectures=armeabi-v7a,arm64-v8a"
```

> Las comillas son obligatorias en PowerShell: sin ellas interpreta la coma como
> operador de array y falla con `Falta un argumento en la lista de parámetros`.
> En CMD o Git Bash el argumento va sin comillas.

## Firma

`android/app/build.gradle` lee las credenciales de `android/keystore.properties`,
que **no se versiona** (igual que `android/app/release.keystore`). Si el archivo no
existe, el build de release cae a la firma de debug para que un clon limpio del
repo siga compilando.

> Guarda una copia de `release.keystore` y de su contraseña fuera del PC. Android
> identifica la app por su firma: si la pierdes no podrás instalar una
> actualización encima de la ya instalada, tendrías que desinstalar (y perder la
> base de datos SQLite del dispositivo).

Para regenerarlo desde cero:

```powershell
& "$env:JAVA_HOME\bin\keytool.exe" -genkeypair -v -storetype PKCS12 `
  -keystore android\app\release.keystore -alias calendarmemory `
  -keyalg RSA -keysize 2048 -validity 10950
```

Luego copia `android/keystore.properties.example` a `android/keystore.properties`
y rellena las contraseñas.

## Generar el APK

Gradle se invoca desde `android/`, así que todo este flujo asume esa carpeta como
directorio de trabajo:

```powershell
cd C:\dev\CalendarMemory\android
.\gradlew.bat assembleRelease
``


Salida: `android/app/build/outputs/apk/release/app-release.apk`.

El APK de release trae el bundle JS embebido: funciona sin PC y sin Metro.

## Instalarlo

**Por cable** (con depuración USB activada en Opciones de desarrollador). Ojo con
el directorio: la ruta de abajo es relativa a `android/`, que es donde te dejó el
paso anterior.

```powershell
adb install -r app\build\outputs\apk\release\app-release.apk
```

Desde la raíz del repo sería `android\app\build\outputs\apk\release\app-release.apk`.

`-r` reinstala conservando los datos (la base SQLite con semestres y tareas),
siempre que la firma sea la misma.

Si `adb` responde `device unauthorized`, reinicia su daemon —no hace falta tocar
nada en el teléfono— y acepta el diálogo de autorización si aparece:

```powershell
adb kill-server; adb start-server; adb devices
```

Debe listar el dispositivo como `device`, no como `unauthorized`.

**Sin cable**: copia el `.apk` al teléfono (Drive, cable MTP, WhatsApp a ti mismo)
y ábrelo desde el explorador de archivos. Android pedirá permitir "instalar apps
desconocidas" para esa aplicación; es un permiso por-app, se concede una vez.

## Actualizar la app

Recompila con `assembleRelease` e instala encima. Si cambias algo que Android usa
para decidir si es una actualización, sube `versionCode` en
`android/app/build.gradle` (entero incremental) y `versionName` (la etiqueta que
ve el usuario).

## Desarrollo diario

Para iterar sigue usando el flujo de debug, que recarga el JS desde Metro:

```powershell
npm start          # terminal 1
npm run android    # terminal 2
```

## Iconos

`scripts/generate-icons.ps1` regenera todos los iconos (launcher legacy, foreground
adaptativo, monochrome de Android 13+ y el icono de statusbar) desde una única
definición del glifo. Ejecútalo tras cambiar colores o forma:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\generate-icons.ps1
```
