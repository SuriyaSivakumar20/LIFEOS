# LIFEOS Architecture Specification

LIFEOS is a personal life operating system combining financial tracking, habits, tasks, reflections, and the Alfred AI companion in a local-first, privacy-respecting architecture.

---

## Clean Architecture & Package Boundaries

```
apps/
  mobile/
    src/
      app/               # Expo Router screen definitions
      components/        # Application-specific UI components (AppShell, AppHeader)
      navigation/        # Navigation configurations
      stores/            # Zustand global reactive state & action dispatcher

packages/
  shared-types/          # Canonical domain entities, enums, DTOs & repository interfaces
  core/                  # Pure business rules, calculations, entities & validation schemas
    calculations/        # Money formatting, streak calculation, local time greeting
    validation/          # Zod validation schemas
    entities/            # UUID and timestamp generation
    use-cases/           # Home dashboard and money overview domain use cases
  database/              # Local persistence, schemas, migrations, adapters & repositories
    schema/              # SQLite DDL & Dexie IndexedDB schemas
    migrations/          # Idempotent database migrations & default data seeding
    adapters/            # Platform-specific adapters:
      sqlite/            # Expo SQLite adapter (iOS / Android)
      indexeddb/         # Dexie IndexedDB adapter (Web)
    repositories/        # Concrete repositories adhering to interfaces
  ui/                    # Reusable Design System components & theme tokens
    tokens/              # Colors (Dark mode default), Spacing, Radii, Typography, Shadows
    theme-context/       # ThemeProvider and useTheme hooks
    components/          # Button, Input, Card, IconButton, SectionHeader, EmptyState, ScreenContainer, BottomNavigation, WebSidebar
  alfred/                # Future AI orchestration interfaces & default suggested prompts
  voice/                 # Future speech-to-text service interfaces
  notifications/         # Future notification scheduling interfaces

docs/                    # Comprehensive system documentation
tests/                   # Fast automated unit and integration tests
```

---

## Core Tenets

1. **Local-First & Offline**:
   - Zero remote databases.
   - All persistence is on the user's physical device.
   - SQLite for native mobile, IndexedDB for modern web browsers.
2. **Honest Data**:
   - Financial balances and category breakdowns are computed strictly from stored records.
   - If no records exist, clean empty states are presented. No fabricated metrics or simulated productivity scores.
3. **Clean Decoupling**:
   - UI components never write raw SQL queries or touch low-level storage engines.
   - UI consumes domain models via Zustand stores that delegate to concrete repositories implementing interface contracts.
4. **Responsive User Interface**:
   - Dark mode by default (`#242321` primary background, `#F28C28` accent, `#45413B` border).
   - Light mode alternative available in Settings.
   - Mobile: 5-item bottom bar for primary workflows + top bar navigation for secondary screens.
   - Desktop Web: full sidebar showing all 8 destinations.
