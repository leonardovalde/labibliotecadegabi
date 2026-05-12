# Diagrama Entidad-Relación — La Biblioteca de Gabi

```mermaid
erDiagram
    users {
        uuid id PK
        varchar username UK
        varchar display_name
        varchar password_b64
        text avatar_url
        text bio
        timestamp created_at
    }

    sessions {
        varchar token PK
        uuid user_id FK
        timestamp expires_at
    }

    follows {
        uuid follower_id FK
        uuid following_id FK
        timestamp created_at
    }

    books {
        uuid id PK
        varchar isbn
        varchar open_library_id
        varchar google_books_id
        varchar title
        varchar original_language
        text cover_url
        integer pages
        integer year_published
        varchar[] genres
        boolean is_saga
        varchar saga_name
        integer saga_order
        timestamp created_at
    }

    authors {
        uuid id PK
        varchar open_library_id
        varchar name
        varchar nationality
        enum gender
        timestamp created_at
    }

    book_authors {
        uuid book_id FK
        uuid author_id FK
    }

    user_books {
        uuid id PK
        uuid user_id FK
        uuid book_id FK
        text cover_url
        enum status
        enum format
        boolean wishlist
        smallint rating
        date read_at
        text notes
        timestamp created_at
        timestamp updated_at
    }

    collections {
        uuid id PK
        uuid user_id FK
        varchar name
        timestamp created_at
    }

    collection_books {
        uuid collection_id FK
        uuid book_id FK
    }

    tags {
        uuid id PK
        uuid user_id FK
        varchar name
    }

    book_tags {
        uuid book_id FK
        uuid tag_id FK
    }

    users ||--o{ sessions : "tiene"
    users ||--o{ follows : "sigue (follower)"
    users ||--o{ follows : "es seguido (following)"
    users ||--o{ user_books : "tiene en biblioteca"
    users ||--o{ collections : "crea"
    users ||--o{ tags : "crea"

    books ||--o{ book_authors : "escrito por"
    books ||--o{ user_books : "agregado a"
    books ||--o{ book_tags : "etiquetado con"
    books ||--o{ collection_books : "pertenece a"

    authors ||--o{ book_authors : "escribe"

    collections ||--o{ collection_books : "contiene"
    tags ||--o{ book_tags : "aplicado a"
```

---

## Notas clave

**`books`** — catálogo global compartido. Un libro existe una sola vez aunque muchos usuarios lo tengan.

**`user_books`** — inventario personal. Cada fila es la relación entre un usuario y un libro. Aquí viven:
- `cover_url` — portada personalizada por usuario (sobreescribe la de `books`)
- `status` — estado de lectura personal
- `rating` — calificación personal
- `format` — físico / digital / audiolibro
- `wishlist` — si está en lista de deseos

**`follows`** — auto-referencia en `users`. `follower_id` sigue a `following_id`.

**`tags` y `collections`** — pertenecen al usuario, no al libro globalmente.
