# Kairos — TypeORM Migrations Specification

## Context

Kairos uses TypeORM with SQLite. Currently, database schema changes are applied via
`synchronize: true` in development, which auto-creates/alters tables on every app
start. There are no migrations. This works for solo development but is insufficient
for:

- Production deployments where `synchronize: false` is mandatory (TypeORM itself
  warns against `synchronize: true` in production — it can drop columns/tables).
- Reproducible database state across environments (local, staging, production).
- Tracking schema history in version control.
- Safe schema changes (e.g., adding columns to existing tables with data).

## Goal

Introduce TypeORM migrations as the authoritative mechanism for database schema
changes. After this spec:

- `synchronize` is always `false` (both dev and prod).
- A migrations directory holds versioned migration files.
- CLI commands generate and run migrations.
- The initial migration captures the current schema state (baseline).
- New schema changes go through migrations, not `synchronize`.

## Design

### Migration Infrastructure

**Location:** `backend/src/database/migrations/`

TypeORM stores migrations as TypeScript files in a dedicated directory. The
`TypeOrmModule` configuration points to this directory via the `migrations`
option.

**Configuration change in `app.module.ts`:**

```typescript
// Before
synchronize: process.env.NODE_ENV === 'development',
logging: process.env.NODE_ENV === 'development',

// After
synchronize: false,
logging: false,
migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
```

- `synchronize: false` — always. Migrations own the schema.
- `logging: false` — production default; override with `TYPEORM_LOGGING=1` env var
  for debugging.

### CLI Commands in `package.json`

Add scripts for migration lifecycle:

```json
{
  "scripts": {
    "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/database/data-source.ts",
    "migration:create": "typeorm-ts-node-commonjs migration:create -d src/database/data-source.ts",
    "migration:run": "typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/database/data-source.ts"
  }
}
```

- `migration:generate <Name>` — compares entity definitions against the current
  database and generates a migration file with the diff. Requires a live database.
- `migration:create <Name>` — creates an empty migration skeleton for manual
  SQL/scripted changes.
- `migration:run` — applies all pending migrations.
- `migration:revert` — rolls back the last executed migration.

### Data Source File

**Location:** `backend/src/database/data-source.ts`

TypeORM's CLI needs a standalone data source file (separate from the NestJS app)
that configures the database connection for CLI operations:

```typescript
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({ path: '.env' });

export default new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE || './data.sqlite',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
```

This mirrors the `TypeOrmModule.forRootAsync` settings so the CLI and the app
see the same entities and migrations.

### Initial Baseline Migration

The first migration captures the current database schema as-is. This is the
"zero" migration that brings a fresh database to the current state.

**Process:**
1. Run the app with `synchronize: true` once to create the current schema.
2. Set `synchronize: false`.
3. Run `npm run migration:generate InitialSchema` — TypeORM compares entities
   against the DB and generates `InitialSchema_<timestamp>.ts`.
4. Commit the migration file.

**Result:** A fresh database starts empty. Running `migration:run` creates all
tables to match the current entity definitions.

### Migration Naming Convention

- Use descriptive, action-oriented names: `AddPausedAtToMeetings`,
  `CreateMeetingNotesTable`, `RenameUserEmailColumn`.
- TypeORM auto-appends a timestamp: `AddPausedAtToMeetings1720700000000.ts`.
- Never rename or delete migration files. They are immutable historical records.
- If a migration needs fixing, create a new migration that corrects it.

### Development Workflow

1. **Modify an entity** (e.g., add `pausedAt` to `Meeting`).
2. **Generate:** `npm run migration:generate AddPausedAtToMeetings`.
3. **Review** the generated `up()` and `down()` methods.
4. **Run:** `npm run migration:run`.
5. **Commit** the migration file alongside the entity change.

For complex changes that TypeORM can't auto-detect (e.g., data migrations,
column renames with data preservation), use `migration:create` and write the
`query()` calls manually.

### Production Deployment

On deployment (e.g., via Ansible), run migrations before starting the app:

```bash
cd backend
npm run migration:run
npm run start:prod
```

The migration runner is idempotent — already-applied migrations are skipped.
The `migrations` table in SQLite tracks which migrations have been applied.

If a deployment fails mid-migration, `migration:revert` rolls back, and the
next deploy re-applies.

### Existing `synchronize` Dependency — Cutover

Currently, `synchronize: true` in development means the local database is
auto-synced. The cutover to migrations requires a one-time baseline:

1. Ensure the local database is up-to-date (run the app once with current entities).
2. Generate the baseline migration.
3. Delete the local SQLite database file.
4. Set `synchronize: false`.
5. Run `migration:run` — the baseline migration recreates the schema.
6. Verify all tables match entity definitions.

After this, `synchronize` is never used again.

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Fresh database, no migrations | App starts with empty DB. Migrations must be run before first use. |
| Migration fails mid-run | TypeORM marks it as pending. Next `migration:run` retries. Manual `migration:revert` available. |
| Entity changed but no migration | App starts. Query fails at runtime (column not found). Developer must generate and run the migration. |
| Two developers generate migrations against different baselines | The second developer's migration may conflict. Resolve by pulling latest, deleting local DB, running all migrations, then regenerating. |
| SQLite `ALTER TABLE` limitations | SQLite doesn't support all `ALTER TABLE` operations (e.g., dropping columns before SQLite 3.35.0). TypeORM handles this via table recreation. If manual intervention is needed, use `migration:create` with explicit SQL. |
| `migrations` table missing | TypeORM auto-creates `migrations` table on first `migration:run`. |

### File Change Summary

```
backend/src/app.module.ts              — synchronize: false, add migrations path
backend/src/database/data-source.ts    — NEW: CLI data source
backend/src/database/migrations/       — NEW: migrations directory
backend/src/database/migrations/InitialSchema_<ts>.ts — NEW: baseline migration
backend/package.json                   — Add migration:generate, create, run, revert scripts
```

### Acceptance Criteria

1. `synchronize` is `false` in all environments.
2. A `data-source.ts` file exists and is used by all TypeORM CLI commands.
3. `package.json` has `migration:generate`, `migration:create`, `migration:run`,
   and `migration:revert` scripts.
4. A baseline migration captures the current schema state.
5. Running `migration:run` on a fresh database creates all tables matching
   current entity definitions.
6. The `migrations` table tracks applied migrations.
7. New entity changes require a migration file (not `synchronize`).
8. The migration workflow is documented and does not require `synchronize`
   at any point.
