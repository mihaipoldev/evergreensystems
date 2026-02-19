# Reports Module Architecture

> AI guide for understanding and extending the reports system.
> Read this file before making changes to `src/features/rag/reports/`.

## Quick Reference

**To add a new automation**, you need exactly **3 things**:

1. A component folder at `components/<name>/` with `types.ts`, `transform.ts`, root component, and `sections/`
2. One entry in `registry.ts`
3. That's it. No other files to touch.

---

## How Data Flows

```
DB (rag_run_outputs.output_json)
  │
  ▼
transformOutputJson()          ← utils/transformOutputJson.ts
  │  reads meta.automation_name
  │  looks up TRANSFORM_MAP from registry
  ▼
per-automation transform()     ← components/<name>/transform.ts
  │  reshapes data if needed
  │  calls buildReportMeta(raw) for standardized meta
  ▼
ReportData { meta, data }      ← types/meta.ts
  │
  ├──► ReportRouter            reads COMPONENT_MAP from registry
  │      ▼
  │    <RootComponent>         e.g. NicheReport, ICPReport
  │      ▼
  │    <SectionComponents>     e.g. BasicProfileSection, TriggersSection
  │
  ├──► ReportHeader            reads HEADER_MAP via getHeaderConfigForWorkflow()
  │
  └──► TableOfContents         reads SECTIONS_MAP via getSectionsForReport()
```

## File Structure

```
src/features/rag/reports/
├── registry.ts                 ★ SINGLE SOURCE OF TRUTH for all automations
├── types/
│   ├── meta.ts                 Shared types: ReportMeta, ReportData, HeaderConfig, ReportSection
│   └── index.ts                Barrel re-export
├── utils/
│   ├── transformOutputJson.ts  Entry point: raw JSON → ReportData (dispatches to per-automation)
│   ├── buildReportMeta.ts      Shared helper: raw meta → ReportMeta with safe defaults
│   └── getSectionsForReport.ts Shared helper: automation_name → section list with dynamic extras
├── components/
│   ├── ReportRouter.tsx        Routes automation_name → root component (reads COMPONENT_MAP)
│   ├── layout/                 ReportHeader, ReportLayout, TableOfContents, etc.
│   ├── shared/                 Reusable UI: SectionWrapper, ContentCard, StatCard, etc.
│   ├── niche-intelligence/     ← automation folder
│   ├── icp-research/           ← automation folder
│   ├── niche-evaluation/       ← automation folder
│   └── outbound-strategy/      ← automation folder
└── data/
    └── getReportData.ts        Server-side data fetching from Supabase
```

## Automation Folder Structure

Every automation follows this exact pattern:

```
components/<automation-name>/
├── types.ts           Data shape type + SECTIONS array
├── transform.ts       Raw payload → ReportData (uses buildReportMeta)
├── <RootComponent>.tsx  Root component that renders all sections
├── index.ts           Barrel export for the root component
└── sections/
    ├── <Section1>.tsx
    ├── <Section2>.tsx
    └── index.ts       Barrel export for all sections
```

## The Registry (registry.ts)

The registry is an array of `AutomationDescriptor` objects. Each has:

| Field       | Type                 | Description |
|-------------|----------------------|-------------|
| `name`      | `string`             | Primary kebab-case automation_name (must match `meta.automation_name` from the backend) |
| `aliases`   | `string[]`           | Alternative names that route to the same automation (same header/component) |
| `header`    | `HeaderConfig`       | `reportTypeLabel`, `modeLabel`, `subtitle`, `showStatsCards` |
| `sections`  | `ReportSection[]`    | Table-of-contents entries. Imported from the automation's `types.ts` |
| `transform` | `AutomationTransform`| The transform function from the automation's `transform.ts` |
| `component` | `ReportComponent`    | The root component from the automation folder |

**Aliases vs separate entries:** If two automation names share the same header, make one the primary and the other an alias. If they need different headers (e.g. `outbound-strategy` vs `offer-architect`), make them separate entries that share the same `transform`, `component`, and `sections`.

Four derived lookup maps are built automatically:
- `TRANSFORM_MAP` — used by `transformOutputJson.ts`
- `COMPONENT_MAP` — used by `ReportRouter.tsx`
- `HEADER_MAP` — used by `ReportHeaderConfig.ts`
- `SECTIONS_MAP` — used by `getSectionsForReport.ts`

---

## Step-by-Step: Adding a New Automation

### 1. Create the folder

```
components/my-new-automation/
├── types.ts
├── transform.ts
├── MyNewReport.tsx
├── index.ts
└── sections/
    ├── OverviewSection.tsx
    ├── DetailsSection.tsx
    └── index.ts
```

### 2. Define types and sections (`types.ts`)

```ts
import type { BaseReportData, ReportSection } from "../../types/meta";

export type MyNewData = {
  overview?: Record<string, unknown>;
  details?: Record<string, unknown>;
};

export type MyNewReportData = BaseReportData<MyNewData>;

export const MY_NEW_SECTIONS: ReportSection[] = [
  { id: "overview", number: "01", title: "Overview" },
  { id: "details", number: "02", title: "Details" },
];
```

**Important:** The `id` field must match the `id` prop passed to `<SectionWrapper>` in each section component. This is how the table-of-contents scroll navigation works.

### 3. Write the transform (`transform.ts`)

```ts
import type { ReportData } from "../../types";
import { buildReportMeta } from "../../utils/buildReportMeta";

export function transformMyNew(payload: {
  meta: Record<string, any>;
  data: Record<string, any>;
}): ReportData {
  const meta = payload.meta || {};
  const data = payload.data || {};

  // If your backend sends confidence as 0-100, normalize it:
  // const rawConfidence = typeof meta.confidence === "number" ? meta.confidence : 0;
  // const confidence = rawConfidence > 1 ? rawConfidence / 100 : rawConfidence;
  // return { meta: buildReportMeta(meta, { confidence }), data };

  return {
    meta: buildReportMeta(meta),
    data,
  };
}
```

Most transforms are this simple. Only add reshaping logic if the backend data structure doesn't match what your components expect.

### 4. Build section components (`sections/*.tsx`)

Each section receives data via props from the root component. Use `SectionWrapper` for consistent layout:

```tsx
"use client";

import { SectionWrapper } from "../../shared/SectionWrapper";

interface OverviewSectionProps {
  overview: Record<string, unknown>;
  sectionNumber: string;
}

export const OverviewSection = ({ overview, sectionNumber }: OverviewSectionProps) => {
  return (
    <SectionWrapper
      id="overview"               // ← must match the id in SECTIONS array
      number={sectionNumber}
      title="Overview"
      subtitle="High-level summary"
    >
      {/* Your section content here */}
    </SectionWrapper>
  );
};
```

Barrel-export all sections from `sections/index.ts`.

### 5. Build the root component (`MyNewReport.tsx`)

```tsx
"use client";

import type { ReportData } from "../../types";
import { ConfidenceBadge, SourcesUsedSection } from "../shared";
import { OverviewSection, DetailsSection } from "./sections";

interface MyNewReportProps {
  data: ReportData;
  reportId: string;
}

export const MyNewReport = ({ data, reportId }: MyNewReportProps) => {
  const dataAny = data.data as Record<string, unknown>;

  return (
    <>
      <ConfidenceBadge
        value={data.meta.confidence}
        rationale={data.meta.confidence_rationale}
      />
      <OverviewSection
        overview={(dataAny?.overview as Record<string, unknown>) ?? {}}
        sectionNumber="01"
      />
      <DetailsSection
        details={(dataAny?.details as Record<string, unknown>) ?? {}}
        sectionNumber="02"
      />
      {data.meta.sources_used?.length > 0 && (
        <SourcesUsedSection sources={data.meta.sources_used} reportId={reportId} />
      )}
    </>
  );
};
```

Barrel-export from `index.ts`:
```ts
export { MyNewReport } from "./MyNewReport";
```

### 6. Register it (`registry.ts`)

Add imports at the top and one entry to the `AUTOMATIONS` array:

```ts
// ── Components ──
import { MyNewReport } from "./components/my-new-automation";

// ── Transforms ──
import { transformMyNew } from "./components/my-new-automation/transform";

// ── Section definitions ──
import { MY_NEW_SECTIONS } from "./components/my-new-automation/types";

// Then add to the AUTOMATIONS array:
{
  name: "my-new-automation",
  aliases: [],
  header: {
    reportTypeLabel: "My New Report",
    modeLabel: "Analysis Mode",
    subtitle: "Comprehensive analysis of something specific",
    showStatsCards: false,
  },
  sections: MY_NEW_SECTIONS,
  transform: transformMyNew,
  component: MyNewReport,
},
```

### 7. Verify

Run `npm run build`. If it compiles, you're done.

---

## Shared Components (components/shared/)

Use these instead of building from scratch:

| Component | Purpose |
|-----------|---------|
| `SectionWrapper` | Wraps every section with number, title, subtitle, and scroll-mt |
| `ContentCard` | Card with optional title, variants: `default`, `highlight`, `warning` |
| `StatCard` | Single metric display with icon, label, value |
| `InsightList` | Bulleted list of insights/findings |
| `DataTable` | Key-value table |
| `TagCloud` | Tags/chips for lists of keywords |
| `ConfidenceBadge` | Shows confidence score with optional rationale |
| `SourcesUsedSection` | Renders the list of research sources |
| `ReportCollapsibleCard` | Collapsible card with title and content |
| `DimensionScoreBar` | Horizontal bar with score and label |
| `NumberedCard` | Card with a numbered header |

## Key Types (types/meta.ts)

- **`ReportMeta`** — Standardized meta for ALL automations (automation_name, input, confidence, sources, etc.)
- **`ReportData`** — `{ meta: ReportMeta; data: Record<string, unknown> }` — the universal report shape
- **`BaseReportData<T>`** — Generic version for typed data (e.g. `BaseReportData<NicheIntelligenceData>`)
- **`ReportSection`** — `{ id, number, title }` — used for table of contents
- **`HeaderConfig`** — `{ reportTypeLabel, modeLabel, subtitle, showStatsCards }` — page header config

## Conventions

- **automation_name** is always kebab-case (e.g. `niche-intelligence`, `icp-research`)
- **Section ids** are kebab-case and must match between the `SECTIONS` array and the `SectionWrapper` id prop
- **Section numbers** are zero-padded strings: `"01"`, `"02"`, etc.
- **Confidence** should be 0-1 scale. If the backend sends 0-100, normalize in the transform via `buildReportMeta(meta, { confidence: raw / 100 })`
- Every section component must have `"use client"` at the top (they use framer-motion)
- Root components receive `{ data: ReportData; reportId: string }` as props
