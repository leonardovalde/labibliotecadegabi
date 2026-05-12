# Sistema de Inventario de Libros — Requerimientos

## Visión General

Aplicación personal para gestionar una biblioteca de libros, con búsqueda de datos externos, seguimiento de lectura, y estadísticas. Diseñada para escalar a una biblioteca compartida en el futuro.

---

## API Externa

### Open Library (principal)
- URL: https://openlibrary.org/developers/api
- Sin API key requerida
- Provee: título, autor, ISBN, portada, género, año, idioma original, número de páginas
- Portadas: `https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg`

### Google Books API (complementaria)
- URL: https://developers.google.com/books
- Útil para datos adicionales: descripción, saga, editorial
- Requiere API key gratuita

---

## Base de Datos — PostgreSQL

### Tabla: `books`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `UUID` (PK) | Identificador interno, útil para biblioteca futura |
| `isbn` | `VARCHAR(13)` | Identificador universal del libro (ISBN-13) |
| `open_library_id` | `VARCHAR` | ID en Open Library (ej: `OL7353617M`) |
| `google_books_id` | `VARCHAR` | ID en Google Books |
| `title` | `VARCHAR` | Título del libro |
| `original_language` | `VARCHAR` | Idioma original del libro |
| `cover_url` | `TEXT` | URL de la portada |
| `pages` | `INTEGER` | Número de páginas |
| `year_published` | `INTEGER` | Año de publicación |
| `genre` | `VARCHAR[]` | Géneros (array) |
| `is_saga` | `BOOLEAN` | Si pertenece a una saga |
| `saga_name` | `VARCHAR` | Nombre de la saga |
| `saga_order` | `INTEGER` | Número en la saga |
| `created_at` | `TIMESTAMP` | Fecha de registro |

### Tabla: `authors`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `UUID` (PK) | Identificador interno |
| `open_library_id` | `VARCHAR` | ID en Open Library |
| `name` | `VARCHAR` | Nombre completo |
| `nationality` | `VARCHAR` | País de origen |
| `gender` | `ENUM` | `male`, `female`, `non_binary`, `unknown` |
| `created_at` | `TIMESTAMP` | Fecha de registro |

### Tabla: `book_authors` (relación muchos a muchos)

| Campo | Tipo |
|---|---|
| `book_id` | `UUID` (FK → books) |
| `author_id` | `UUID` (FK → authors) |

### Tabla: `user_books` (inventario personal)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `UUID` (PK) | |
| `book_id` | `UUID` (FK → books) | |
| `status` | `ENUM` | `quiero_leer`, `leyendo`, `leido`, `abandonado`, `pausado` |
| `wishlist` | `BOOLEAN` | En lista de deseos |
| `rating` | `SMALLINT` | Calificación personal 1–5 |
| `read_at` | `DATE` | Fecha en que terminó de leerlo |
| `notes` | `TEXT` | Notas o reseña personal |
| `created_at` | `TIMESTAMP` | |
| `updated_at` | `TIMESTAMP` | |

### Tabla: `collections` (estantes personalizados)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `UUID` (PK) | |
| `name` | `VARCHAR` | Ej: "favoritos", "prestados", "regalados" |
| `created_at` | `TIMESTAMP` | |

### Tabla: `collection_books`

| Campo | Tipo |
|---|---|
| `collection_id` | `UUID` (FK → collections) |
| `book_id` | `UUID` (FK → books) |

### Tabla: `tags`

| Campo | Tipo |
|---|---|
| `id` | `UUID` (PK) |
| `name` | `VARCHAR` (único) |

### Tabla: `book_tags`

| Campo | Tipo |
|---|---|
| `book_id` | `UUID` (FK → books) |
| `tag_id` | `UUID` (FK → tags) |

---

## Funcionalidades

### Búsqueda y registro de libros
- Buscar libro por título, autor o ISBN usando Open Library / Google Books
- Autocompletar datos del libro desde la API
- Registrar libro manualmente si no está en la API
- Mostrar portada tipo película (imagen grande, estilo poster)

### Filtros
- Por estado de lectura
- Por autor
- Por nacionalidad del autor
- Por género del autor
- Por género literario
- Por saga
- Por idioma original
- Por colección
- Por tags
- Por calificación
- Por lista de deseos

### Gestión personal
- Cambiar estado de lectura
- Agregar/quitar de lista de deseos
- Calificar libro (1–5 estrellas)
- Agregar notas personales
- Asignar a colecciones
- Agregar tags libres

### Estadísticas
- Libros leídos por año y por mes
- Páginas totales leídas
- Diversidad de autores por género (% hombres / mujeres / no binario)
- Diversidad de autores por nacionalidad
- Géneros más leídos
- Promedio de calificación

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Astro (SSR + API Routes) |
| Base de datos (local) | PostgreSQL en Docker |
| Base de datos (producción) | NeonDB (serverless Postgres) |
| ORM | Drizzle ORM |
| Estilos | TailwindCSS |
| Deploy | Vercel (`@astrojs/vercel` adapter) |
| API externa | Open Library + Google Books |

### Notas de infraestructura
- Docker Compose para levantar Postgres local en desarrollo
- Variable de entorno `DATABASE_URL` apunta a Docker en local y a NeonDB en producción
- Drizzle permite migrar sin cambios de código entre ambos (mismo driver `postgres`)
- Vercel despliega Astro en modo SSR con el adapter oficial

---

## Consideraciones Futuras (biblioteca compartida)

- El campo `id` UUID en `books` permite referenciar libros desde otros sistemas
- Agregar tabla `users` para multiusuario
- `user_books` ya está diseñada por usuario (agregar `user_id` cuando escale)
- Los ISBNs permiten integración con sistemas de biblioteca estándar (MARC21, etc.)
