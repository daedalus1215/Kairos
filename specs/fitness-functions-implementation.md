---
title: Fitness Functions Implementation
status: draft
project: kairos
location: specs/fitness-functions-implementation.md
created: 2026-07-13
tags: [architecture, quality-gates, automation, typeorm, nestjs]
---

# Fitness Functions Implementation

## Context

Kairos is a NestJS/TypeORM backend for meeting cost calculations. Unlike Callisto (which has established fitness functions), Kairos currently has no automated architectural or naming convention enforcement. This spec defines the initial implementation of fitness functions to ensure code quality and consistency as the project grows.

## Goal

Implement automated fitness functions that run as part of CI/CD to enforce:
1. TypeORM migration naming conventions
2. Architectural boundaries and dependency rules
3. Code quality standards

## Fitness Functions to Implement

### 1. Migration Naming Convention Check

**Purpose:** Enforce consistent TypeORM migration file naming conventions from day one.

**Convention:**
- **Filename:** `{unix_timestamp}-{action}__{description}__{table_name}_table.ts`
- **Class:** `{Action}_{Description}_{TableName}Table{timestamp}`
- **Name:** `'{Action}_{Description}_{TableName}Table{timestamp}'`

**Rules:**
- Timestamp: 13-digit unix timestamp
- Action: `create` | `alter` | `seed` | `update` | `drop`
- Description: required for alter/update/drop, optional for create/seed
  - lowercase snake_case with hyphens allowed
- Table name: lowercase snake_case (embedded before `_table` suffix)
- Suffix: `_table` or `_tables`
- Extension: `.ts` only
- Class name: PascalCase conversion of filename segments joined by `_`
- Name property: must equal the class name as a string literal

**File:** `backend/fitness-functions-rules/naming-rules/check-migration-naming.ts`

---

### 2. Architecture Dependency Check

**Purpose:** Prevent circular dependencies and enforce clean architecture boundaries.

**Rules to enforce:**
- No orphaned files (files with no imports or dependents, except migrations/tests)
- Domain modules should not have circular dependencies
- Infrastructure layer should not depend on application layer
- Application layer should not depend on presentation layer

**Tool:** dependency-cruiser

**File:** `backend/fitness-functions-rules/architecture/check-dependencies.ts`

---

### 3. Console Log Detector

**Purpose:** Prevent accidental `console.log` statements in production code.

**Rules:**
- `console.log`, `console.warn`, `console.error` are not allowed in source files
- Exceptions: migration files (for TypeORM logging)

**File:** `backend/fitness-functions-rules/quality/check-console-logs.ts`

---

## Directory Structure

```
backend/
├── fitness-functions-rules/
│   ├── naming-rules/
│   │   └── check-migration-naming.ts
│   ├── architecture/
│   │   ├── check-dependencies.ts
│   │   └── dependency-cruiser.config.js
│   ├── quality/
│   │   └── check-console-logs.ts
│   └── run-all-fitness-checks.ts
└── package.json (updated with scripts)
```

## Implementation: Migration Naming Check

```typescript
/**
 * Migration Naming Convention Fitness Function
 *
 * Enforces that TypeORM migration files follow the naming convention.
 *
 * Usage: npx ts-node -r tsconfig-paths/register fitness-functions-rules/naming-rules/check-migration-naming.ts
 */

import * as fs from 'fs';
import * as path from 'path';

type ViolationType = 'filename' | 'class-name' | 'name-property';

type Violation = {
  type: ViolationType;
  filename: string;
  message: string;
};

const MIGRATIONS_DIR = path.resolve('src/database/migrations');

const VALID_ACTIONS = ['create', 'alter', 'seed', 'update', 'drop'] as const;

// create/seed: description is optional
// alter/update/drop: description is required
const CREATE_SEED_PATTERN =
  /^\d{13}-(create|seed)(__[a-z][a-z0-9_-]*)?__[a-z][a-z0-9_-]*_tables?\.ts$/;

const ALTER_UPDATE_DROP_PATTERN =
  /^\d{13}-(alter|update|drop)__[a-z][a-z0-9_-]*__[a-z][a-z0-9_-]*_tables?\.ts$/;

/**
 * Pre-existing migrations that violate the convention.
 * These cannot be renamed because they are tracked in TypeORM's migrations table.
 * 
 * NOTE: For Kairos (new project), this should ideally remain empty.
 * Only add migrations here if they were created before this fitness function.
 */
const KNOWN_FILENAME_EXCEPTIONS = new Set<string>([]);

const KNOWN_INTERNAL_EXCEPTIONS = new Set<string>([]);

const isValidMigrationName = (filename: string): boolean =>
  CREATE_SEED_PATTERN.test(filename) || ALTER_UPDATE_DROP_PATTERN.test(filename);

const toPascalCase = (segment: string): string =>
  segment
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

const deriveExpectedClassName = (filename: string): string | undefined => {
  const match = filename.match(/^(\d{13})-(.+)\.ts$/);
  if (!match) return undefined;
  const [, timestamp, body] = match;
  const segments = body.split('__');
  const pascalSegments = segments.map(toPascalCase);
  return `${pascalSegments.join('_')}${timestamp}`;
};

const diagnoseFilenameViolation = (filename: string): string => {
  if (!filename.endsWith('.ts')) {
    return 'Migration files must use .ts extension.';
  }
  const timestampMatch = filename.match(/^(\d+)-/);
  if (!timestampMatch || timestampMatch[1].length !== 13) {
    return 'Filename must start with a 13-digit unix timestamp followed by a hyphen.';
  }
  const afterTimestamp = filename.slice(14);
  const actionMatch = afterTimestamp.match(/^([a-z_]+?)__/);
  if (!actionMatch) {
    return 'Missing double-underscore separator after the action. Expected: {timestamp}-{action}__{description}__{table}_table.ts';
  }
  const action = actionMatch[1];
  if (!VALID_ACTIONS.includes(action as (typeof VALID_ACTIONS)[number])) {
    return `Invalid action "${action}". Must be one of: ${VALID_ACTIONS.join(', ')}.`;
  }
  if (!filename.match(/_tables?\.ts$/)) {
    return 'Filename must end with _table.ts or _tables.ts.';
  }
  return `Does not match expected pattern. Use: {timestamp}-${action}__{description}__{table_name}_table.ts`;
};

const checkFilenameConventions = (files: string[]): Violation[] =>
  files
    .filter(
      (filename) =>
        !KNOWN_FILENAME_EXCEPTIONS.has(filename) && !isValidMigrationName(filename),
    )
    .map((filename) => ({
      type: 'filename' as const,
      filename,
      message: diagnoseFilenameViolation(filename),
    }));

const checkInternalNaming = (files: string[]): Violation[] => {
  const violations: Violation[] = [];
  const validFiles = files.filter(
    (f) => isValidMigrationName(f) && !KNOWN_INTERNAL_EXCEPTIONS.has(f),
  );
  for (const filename of validFiles) {
    const expectedClassName = deriveExpectedClassName(filename);
    if (!expectedClassName) continue;
    
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const classMatch = content.match(/export\s+class\s+(\S+?)[\s{]/);
    const actualClassName = classMatch?.[1];
    
    if (!actualClassName) {
      violations.push({
        type: 'class-name',
        filename,
        message: 'Could not find exported class declaration.',
      });
      continue;
    }
    
    const cleanClassName = actualClassName.replace(/\s+implements\s+.*/, '');
    if (cleanClassName !== expectedClassName) {
      violations.push({
        type: 'class-name',
        filename,
        message: `Class name mismatch.\n   Actual:   ${cleanClassName}\n   Expected: ${expectedClassName}`,
      });
    }
    
    const nameMatch = content.match(/name\s*=\s*['"]([^'"]+)['"]/);
    const actualNameProp = nameMatch?.[1];
    
    if (!actualNameProp) {
      violations.push({
        type: 'name-property',
        filename,
        message: `Could not find name property. Expected: name = '${expectedClassName}'`,
      });
    } else if (actualNameProp !== expectedClassName) {
      violations.push({
        type: 'name-property',
        filename,
        message: `Name property mismatch.\n   Actual:   '${actualNameProp}'\n   Expected: '${expectedClassName}'`,
      });
    }
  }
  return violations;
};

const main = (): void => {
  console.log('🔍 Checking migration file naming conventions...\n');
  
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log(`⚠️  Migration directory not found: ${MIGRATIONS_DIR}`);
    console.log('No migrations to check yet. This is expected for a new project.\n');
    process.exit(0);
  }
  
  const files = fs.readdirSync(MIGRATIONS_DIR);
  
  if (files.length === 0) {
    console.log('No migration files found. This is expected for a new project.\n');
    process.exit(0);
  }
  
  const filenameViolations = checkFilenameConventions(files);
  const internalViolations = checkInternalNaming(files);
  const allViolations = [...filenameViolations, ...internalViolations];
  
  if (allViolations.length === 0) {
    console.log('✅ No migration naming violations found.\n');
    console.log('Migration files correctly follow the naming convention:');
    console.log('  Filename: {timestamp}-{action}__{description}__{table_name}_table.ts');
    console.log('  Class:    {Action}_{Description}_{TableName}Table{timestamp}');
    console.log("  Name:     '{Action}_{Description}_{TableName}Table{timestamp}'");
    process.exit(0);
  }
  
  console.log(`❌ Found ${allViolations.length} migration naming violation(s):\n`);
  
  for (const violation of allViolations) {
    const icon = violation.type === 'filename' ? '📁' : '📄';
    console.log(`${icon} ${violation.filename}`);
    console.log(`   ${violation.message}\n`);
  }
  
  console.log('\n💡 Naming convention:');
  console.log('  Filename: {timestamp}-{action}__{description}__{table_name}_table.ts');
  console.log('  Class:    {Action}_{Description}_{TableName}Table{timestamp}');
  console.log("  Name:     '{Action}_{Description}_{TableName}Table{timestamp}'");
  console.log(`\n  Actions: ${VALID_ACTIONS.join(' | ')}`);
  console.log('  Description: required for alter/update/drop, optional for create/seed');
  console.log('\n  Examples:');
  console.log('    1775698436166-create__meetings_table.ts');
  console.log('    1775698436167-alter__add_cost_column__meetings_table.ts');
  
  process.exit(1);
};

main();
```

## Implementation: Architecture Dependency Check

```typescript
/**
 * Architecture Dependency Fitness Function
 *
 * Runs dependency-cruiser to detect:
 * - Orphan files (unused code)
 * - Circular dependencies
 * - Layer violations (infrastructure → application → domain)
 *
 * Usage: npx ts-node -r tsconfig-paths/register fitness-functions-rules/architecture/check-dependencies.ts
 */

import { execSync } from 'child_process';
import * as path from 'path';

const DEP_CRUISE_CONFIG = path.resolve('fitness-functions-rules/architecture/dependency-cruiser.config.js');

const main = (): void => {
  console.log('🔍 Checking architecture dependencies...\n');
  
  // Check if dependency-cruiser config exists
  if (!require('fs').existsSync(DEP_CRUISE_CONFIG)) {
    console.log('⚠️  Dependency cruiser config not found. Skipping this check.');
    console.log('   Run: npx depcruise --init to create a config file.\n');
    process.exit(0);
  }
  
  try {
    execSync(
      `npx depcruise --config ${DEP_CRUISE_CONFIG} --output-type err src`,
      {
        stdio: ['inherit', 'pipe', 'pipe'],
        cwd: path.resolve('.'),
      }
    );
    console.log('✅ No dependency violations found.\n');
    process.exit(0);
  } catch (error: any) {
    console.log('❌ Architecture dependency violations found:\n');
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.log(error.stderr.toString());
    process.exit(1);
  }
};

main();
```

## Implementation: Console Log Detector

```typescript
/**
 * Console Log Detector Fitness Function
 *
 * Prevents console.log/warn/error from being committed to production code.
 * 
 * Exceptions:
 * - Migration files (TypeORM logging)
 * - Test files (*.spec.ts, *.test.ts)
 * - main.ts (bootstrap logging is acceptable)
 *
 * Usage: npx ts-node -r tsconfig-paths/register fitness-functions-rules/quality/check-console-logs.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface Violation {
  file: string;
  line: number;
  match: string;
}

const EXCLUDED_PATTERNS = [
  /migrations/,
  /\.spec\.ts$/,
  /\.test\.ts$/,
  /\.e2e-spec\.ts$/,
  /main\.ts$/,  // Bootstrap file
];

const CONSOLE_PATTERNS = [
  /console\.log\s*\(/,
  /console\.warn\s*\(/,
  /console\.error\s*\(/,
  /console\.debug\s*\(/,
];

const isExcluded = (filePath: string): boolean => {
  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(filePath));
};

const findConsoleUsages = (dir: string): Violation[] => {
  const violations: Violation[] = [];
  
  const scanDir = (currentDir: string) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and dist
        if (entry.name === 'node_modules' || entry.name === 'dist') continue;
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        if (isExcluded(fullPath)) continue;
        
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          CONSOLE_PATTERNS.forEach((pattern) => {
            const match = line.match(pattern);
            if (match) {
              violations.push({
                file: fullPath,
                line: index + 1,
                match: match[0],
              });
            }
          });
        });
      }
    }
  };
  
  scanDir(dir);
  return violations;
};

const main = (): void => {
  console.log('🔍 Checking for console.* statements in source code...\n');
  
  const srcDir = path.resolve('src');
  
  if (!fs.existsSync(srcDir)) {
    console.log(`Source directory not found: ${srcDir}`);
    process.exit(0);
  }
  
  const violations = findConsoleUsages(srcDir);
  
  if (violations.length === 0) {
    console.log('✅ No console.* statements found in production code.\n');
    console.log('Excluded from check:');
    console.log('  - Migration files');
    console.log('  - Test files (*.spec.ts, *.test.ts)');
    console.log('  - Main bootstrap file (main.ts)');
    process.exit(0);
  }
  
  console.log(`❌ Found ${violations.length} console.* statement(s):\n`);
  
  // Group by file
  const byFile = violations.reduce((acc, v) => {
    acc[v.file] = acc[v.file] || [];
    acc[v.file].push(v);
    return acc;
  }, {} as Record<string, Violation[]>);
  
  for (const [file, fileViolations] of Object.entries(byFile)) {
    console.log(`📁 ${file}`);
    fileViolations.forEach((v) => {
      console.log(`   Line ${v.line}: ${v.match.trim()}`);
    });
    console.log('');
  }
  
  console.log('\n💡 Use a logger service instead of console.* for production code.');
  console.log('   Example: this.logger.log() from @nestjs/common\n');
  
  process.exit(1);
};

main();
```

## Implementation: Master Runner

```typescript
/**
 * Run All Fitness Checks
 *
 * Orchestrates all fitness functions and reports aggregated results.
 *
 * Usage: npm run test:fitness
 */

import { execSync } from 'child_process';
import * as path from 'path';

interface CheckConfig {
  name: string;
  script: string;
  optional?: boolean;
}

const CHECKS: CheckConfig[] = [
  {
    name: 'Migration Naming Convention',
    script: 'fitness-functions-rules/naming-rules/check-migration-naming.ts',
  },
  {
    name: 'Console Log Detector',
    script: 'fitness-functions-rules/quality/check-console-logs.ts',
  },
  {
    name: 'Architecture Dependencies',
    script: 'fitness-functions-rules/architecture/check-dependencies.ts',
    optional: true, // Optional until depcruise config is set up
  },
];

const runCheck = (check: CheckConfig): { name: string; passed: boolean; optional: boolean; output: string } => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${check.name}${check.optional ? ' (optional)' : ''}`);
  console.log('='.repeat(60));
  
  try {
    const output = execSync(
      `npx ts-node -r tsconfig-paths/register ${check.script}`,
      {
        encoding: 'utf-8',
        stdio: ['inherit', 'pipe', 'pipe'],
      }
    );
    console.log(output);
    return { name: check.name, passed: true, optional: !!check.optional, output };
  } catch (error: any) {
    const output = error.stdout || error.message;
    console.log(output);
    return { name: check.name, passed: false, optional: !!check.optional, output };
  }
};

const main = (): void => {
  console.log('\n🏃 Running all fitness functions...\n');
  
  const results = CHECKS.map(runCheck);
  
  console.log('\n' + '='.repeat(60));
  console.log('FITNESS CHECKS SUMMARY');
  console.log('='.repeat(60));
  
  let passedCount = 0;
  let failedCount = 0;
  let optionalFailedCount = 0;
  
  for (const result of results) {
    if (result.passed) {
      console.log(`✅ ${result.name}`);
      passedCount++;
    } else if (result.optional) {
      console.log(`⚠️  ${result.name} (optional - failed but not blocking)`);
      optionalFailedCount++;
    } else {
      console.log(`❌ ${result.name}`);
      failedCount++;
    }
  }
  
  console.log('='.repeat(60));
  console.log(`\nTotal: ${results.length} | ✅ Passed: ${passedCount} | ❌ Failed: ${failedCount} | ⚠️ Optional Failed: ${optionalFailedCount}`);
  
  if (failedCount > 0) {
    console.log('\n❌ Fitness checks failed. Fix violations before committing.\n');
    process.exit(1);
  }
  
  console.log('\n✅ All required fitness checks passed!\n');
  process.exit(0);
};

main();
```

## Integration Steps

1. **Create directory structure:**
   ```bash
   mkdir -p backend/fitness-functions-rules/naming-rules
   mkdir -p backend/fitness-functions-rules/architecture
   mkdir -p backend/fitness-functions-rules/quality
   ```

2. **Create the fitness function files** with content above.

3. **Add npm script to `package.json`:**
   ```json
   {
     "scripts": {
       "test:fitness": "npx ts-node -r tsconfig-paths/register fitness-functions-rules/run-all-fitness-checks.ts"
     }
   }
   ```

4. **Add to CI pipeline:**
   ```yaml
   # .github/workflows/ci.yml or equivalent
   - name: Run Fitness Functions
     working-directory: ./backend
     run: npm run test:fitness
   ```

5. **Optional: Set up dependency-cruiser:**
   ```bash
   cd backend
   npx depcruise --init
   # Move the generated config to fitness-functions-rules/architecture/dependency-cruiser.config.js
   # and update the require path in the check script
   ```

## Success Criteria

- [ ] `npm run test:fitness` executes without errors
- [ ] Migration naming violations are detected and reported with clear messages
- [ ] Console.log statements in production code are flagged
- [ ] CI pipeline fails if required fitness checks fail
- [ ] All fitness functions have clear error messages with remediation guidance
- [ ] Documentation exists for the naming convention in the project wiki/specs

## Migration Convention Quick Reference

| Action | Pattern | Example |
|--------|---------|---------|
| create | `{timestamp}-create__{table}_table.ts` | `1775698436166-create__meetings_table.ts` |
| alter | `{timestamp}-alter__{desc}__{table}_table.ts` | `1775698436167-alter__add_cost_column__meetings_table.ts` |
| update | `{timestamp}-update__{desc}__{table}_table.ts` | `1775698436168-update__fix_cost_data__meetings_table.ts` |
| seed | `{timestamp}-seed__{table}_table.ts` | `1775698436169-seed__meetings_table.ts` |
| drop | `{timestamp}-drop__{desc}__{table}_table.ts` | `1775698436170-drop__obsolete_column__meetings_table.ts` |

## Open Questions

1. Does Kairos need domain boundary rules similar to Chronus (cases vs records separation)?
2. Should we add a check for DTO naming conventions (`*.dto.ts`)?
3. Should we enforce entity naming patterns (`*.entity.ts`)?
4. Should we add a check for proper NestJS module organization?
