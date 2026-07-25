# Calendar Memory — Requisitos del Producto

> Agenda académica: organiza tus **materias** y sus **tareas** en un calendario.
> Uso individual · Offline-first · Reutilizable cada semestre.

---

## 1. Visión

Calendar Memory es una agenda académica personal. El estudiante registra las **materias** que cursa cada semestre y las **tareas** de cada materia (trabajos, parciales, entregas), y las visualiza en un **calendario** organizado por fecha de entrega. El objetivo es no perder de vista ningún vencimiento y poder reutilizar la app semestre tras semestre sin arrastrar datos viejos.

El modelo es jerárquico: **Semestre → Materias → Tareas**.

**Principios rectores**
- **Offline-first:** todo funciona sin conexión. La nube es opcional.
- **Reutilizable:** un semestre nuevo empieza limpio; los anteriores quedan archivados y consultables.
- **Fricción mínima:** crear una tarea y asociarla a una materia debe tomar segundos.
- **Visión de vencimientos:** lo importante es qué se entrega y cuándo.

---

## 2. Requisitos Funcionales (MVP)

### 2.1 Gestión de semestres (CRUD)
- RF-01 Crear un semestre (nombre/periodo, ej. "2026-1", fecha inicio y fin).
- RF-02 Listar los semestres (activo y archivados).
- RF-03 Editar un semestre.
- RF-04 Eliminar un semestre (con confirmación; elimina en cascada sus materias y tareas).
- RF-05 Marcar un semestre como **activo**; solo uno activo a la vez.
- RF-06 Archivar un semestre finalizado sin borrarlo (queda de solo lectura/consulta).

### 2.2 Gestión de materias (CRUD)
- RF-07 Crear una materia dentro de un semestre (nombre, código, color, docente, créditos — opcionales salvo nombre).
- RF-08 Listar las materias del semestre activo.
- RF-09 Editar una materia.
- RF-10 Eliminar una materia (con confirmación; elimina en cascada sus tareas).
- RF-11 Cada materia pertenece a un único semestre.

### 2.3 Gestión de tareas (CRUD)
- RF-12 Crear una tarea asociada a una materia (título obligatorio).
- RF-13 Campos de tarea: descripción, **fecha de entrega**, estado (pendiente/en progreso/hecha), prioridad (baja/media/alta).
- RF-14 Listar las tareas de una materia y las tareas del semestre activo.
- RF-15 Editar una tarea.
- RF-16 Eliminar una tarea (con confirmación).
- RF-17 Cambiar rápidamente el estado de una tarea (marcar como hecha).
- RF-18 Una tarea pertenece a una única materia (y, por transitividad, a un semestre).

### 2.4 Vista de calendario
- RF-19 Calendario mensual con indicador visual en los días que tienen tareas con vencimiento.
- RF-20 El indicador usa el **color de la materia** de la tarea.
- RF-21 Tocar un día abre la lista de tareas que vencen ese día.
- RF-22 Navegación rápida entre meses.
- RF-23 El calendario muestra únicamente las tareas del semestre activo.

### 2.5 Persistencia local
- RF-24 Guardar semestres, materias y tareas en base local (SQLite) con integridad referencial (FK + cascada).
- RF-25 Guardar preferencias (tema, semestre activo, primer día de semana) en almacenamiento clave-valor (tabla SQLite con caché en memoria).

### 2.6 Ajustes básicos
- RF-26 Tema claro/oscuro.
- RF-27 Configurar primer día de la semana.

---

## 3. Requisitos No Funcionales

- RNF-01 **Offline-first:** app 100% usable sin conexión.
- RNF-02 **Rendimiento:** arranque en frío < 2 s; listas y calendario fluidos.
- RNF-03 **Integridad de datos:** eliminar un semestre o materia elimina en cascada lo que contiene; ninguna tarea queda huérfana.
- RNF-04 **Escalabilidad:** consultas indexadas por semestre, por materia y por fecha de entrega.
- RNF-05 **Accesibilidad:** contraste adecuado, tamaños de fuente escalables, labels para lectores de pantalla.
- RNF-06 **Reutilización entre periodos:** cambiar de semestre activo no requiere borrar nada; el histórico se conserva.

---

## 4. Diferenciadores (post-MVP)

Ideas para crecer una vez validado el núcleo. **Fuera del MVP.**

### 4.1 Recordatorios de vencimiento
Notificación local antes de la fecha de entrega (ej. "mañana vence Parcial de Cálculo"). Configurable por tarea.

### 4.2 Calificaciones y promedio
Registrar la nota obtenida por tarea y el peso dentro de la materia; la app calcula el promedio proyectado de cada materia y del semestre.

### 4.3 Resumen de semestre
Al archivar un semestre, vista-resumen: materias cursadas, tareas completadas vs. pendientes, promedio final.

### 4.4 Horario de clases
Además de las entregas, registrar el horario semanal de cada materia (día + hora) y verlo en una vista de agenda semanal.

### 4.5 Filtros y búsqueda
Filtrar tareas por materia, estado y prioridad; buscar por texto en título/descripción.

---

## 5. Fuera de alcance (por ahora)

- Sincronización multi-dispositivo / cuentas en la nube.
- Compartir tareas o materias con otras personas.
- Integración con calendarios externos (Google Calendar, etc.).
- Adjuntar archivos/fotos a las tareas.

Quedan como fases posteriores una vez validado el núcleo local.

---

## 6. Modelo de datos

```
Semestre (1) ──< Materia (N) ──< Tarea (N)

Semestre { id, nombre, fechaInicio, fechaFin, activo, archivado }
Materia  { id, semestreId(FK), nombre, codigo?, color, docente?, creditos? }
Tarea    { id, materiaId(FK), titulo, descripcion?, fechaEntrega?, estado, prioridad }
```

- Estado: `pendiente | en_progreso | hecha`
- Prioridad: `baja | media | alta`
- Borrado en cascada: eliminar Semestre → sus Materias → sus Tareas.

---

## 7. Mapeo a la arquitectura (Clean Architecture por capas)

El repo ya usa la estructura `data / domain / presentation` por feature (ver `features/auth` como referencia).

```
features/
├── semesters/    # CRUD de semestres, selección de semestre activo
├── subjects/     # CRUD de materias del semestre activo
├── tasks/        # CRUD de tareas + cambio de estado
├── calendar/     # vista mensual con indicadores por color de materia
└── settings/     # tema, primer día de semana

core/
└── storage/      # adaptadores: SQLite (semestres/materias/tareas + preferencias)
```

Cada feature: `data/` (datasources, dto, mappers, repositories) · `domain/` (entities, repositories, usecases) · `presentation/` (components, hooks, screens, store).

---

## 8. Dependencias a incorporar

El proyecto está en esqueleto; el MVP requiere añadir:

- **Navegación:** `@react-navigation/native` + stack/tabs.
- **Persistencia:** SQLite (`@op-engineering/op-sqlite`), usado tanto para datos como para preferencias.
- **Calendario:** librería de calendario (ej. `react-native-calendars`) o vista propia.

---

## 9. Priorización sugerida

| Fase | Alcance |
|------|---------|
| **F1 — Fundaciones** | Setup de SQLite (op-sqlite) + navegación. Modelo de datos y migraciones. |
| **F2 — CRUD Semestres** | RF-01 a RF-06. Crear/activar/archivar semestres. |
| **F3 — CRUD Materias** | RF-07 a RF-11. Materias del semestre activo. |
| **F4 — CRUD Tareas** | RF-12 a RF-18. Tareas por materia, estados. |
| **F5 — Calendario** | RF-19 a RF-23. Vista mensual con indicadores. |
| **F6 — Ajustes** | RF-26, RF-27. Tema y preferencias. |
| **F7 — Diferenciadores** | Sección 4 (recordatorios, notas, resumen). |
