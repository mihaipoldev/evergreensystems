# Environment-Based Website Settings Implementation

## Overview

Extend the website settings system to support separate configurations for production and development environments. This allows testing theme, colors, and fonts in development before applying to production. Colors are shared between environments, but each environment can select different colors from the shared palette.

## Database Schema Changes

### 1. Update `website_settings` table

- Change `id` from TEXT PRIMARY KEY with default 'singleton' to support 'production' and 'development'
- Remove default value constraint
- Add CHECK constraint: `id IN ('production', 'development')`
- Migrate existing data: Update row with id='singleton' to id='production'
- Each environment will have its own row with independent settings

### 2. Keep `website_colors` table unchanged

- Colors remain shared between environments (no environment field needed)
- Both production and development can select from the same color palette
- Each environment can have different selected colors, but they reference the same color pool

### 3. Migration file

Create `supabase/migrations/[timestamp]_update_website_settings_for_environments.sql`:

- Update existing singleton row to 'production'
- Add CHECK constraint for id values
- Create 'development' row with default values if it doesn't exist

## Component Implementation

### 1. Update `WebsiteSettings.tsx` component

Location: `src/components/admin/settings/WebsiteSettings.tsx`

Changes:

- Add environment state: `const [environment, setEnvironment] = useState<'production' | 'development'>('production')`
- Add Tabs component at the top with "Production" and "Development" tabs
- Load settings based on selected environment: `eq("id", environment)`
- Save settings with environment id
- Add "Copy from Production" / "Copy from Development" button when viewing opposite environment
- Show clear visual indicator of which environment is active
- Persist selected environment in localStorage: `website-settings-environment`

### 2. Add copy settings functionality

- Create `handleCopySettings` function that:
  - Reads settings from source environment
  - Applies them to target environment
  - Updates theme, primary_color_id, and font_family
  - Shows toast notification on success
- Button placement: Near environment tabs, visible when viewing one environment to copy to the other

### 3. Update style components to read based on NODE_ENV

- `WebsiteColorStyle.tsx`: 
  - Determine environment: `const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production'`
  - Query: `eq("id", environment)`

- `WebsiteFontStyle.tsx`:
  - Same environment detection
  - Query: `eq("id", environment)`

- `PublicThemeProviderWrapper.tsx`:
  - Same environment detection
  - Query: `eq("id", environment)`

## Files to Create/Modify

### New Files:

1. `supabase/migrations/[timestamp]_update_website_settings_for_environments.sql`

### Modified Files:

1. `src/components/admin/settings/WebsiteSettings.tsx` - Add environment tabs and copy functionality
2. `src/components/admin/WebsiteColorStyle.tsx` - Read based on NODE_ENV
3. `src/components/admin/WebsiteFontStyle.tsx` - Read based on NODE_ENV
4. `src/providers/PublicThemeProviderWrapper.tsx` - Read theme based on NODE_ENV
5. `src/lib/supabase/types.ts` - Update website_settings type (id can be 'production' or 'development')

## Implementation Details

### Environment Selector UI

- Use Tabs component from `@/components/ui/tabs`
- Place tabs at the top of WebsiteSettings component, before the Card
- Tabs: "Production" and "Development"
- Show active environment with visual indicator
- Persist selection in localStorage: `website-settings-environment`

### Settings Loading

- When environment changes, reload:
  - Settings (theme, primary_color_id, font_family)
  - Selected color from primary_color_id
  - Font configuration
- Show loading state during environment switch

### Copy Settings Feature

- Button placement: Near environment tabs
- Copy button text: "Copy from Production" when viewing Development, and vice versa
- Functionality:
  ```typescript
  const handleCopySettings = async (fromEnv: 'production' | 'development', toEnv: 'production' | 'development') => {
    // 1. Read settings from source environment
    // 2. Create or update target environment with same values
    // 3. Show success toast
  }
  ```


### Frontend Application (Automatic)

- Server components automatically detect environment via `process.env.NODE_ENV`
- Development builds (`npm run dev`) → use 'development' settings
- Production builds (`npm run build` + `npm start`) → use 'production' settings
- No manual configuration needed on frontend

## Data Flow

```
Admin Panel (WebsiteSettings)
├── User selects "Production" tab
│   ├── Loads settings where id='production'
│   ├── Shows production theme, color, fonts
│   └── Saves changes to id='production'
│
└── User selects "Development" tab
    ├── Loads settings where id='development'
    ├── Shows development theme, color, fonts
    └── Saves changes to id='development'

Frontend (Automatic)
├── NODE_ENV === 'development'
│   └── Reads from id='development'
│
└── NODE_ENV === 'production'
    └── Reads from id='production'
```

## Migration Strategy

1. Update existing 'singleton' row to 'production'
2. Create 'development' row with default values
3. Ensure both environments have valid settings
4. Frontend automatically uses correct environment based on NODE_ENV

## Testing Considerations

- Verify production settings don't affect development
- Verify development settings don't affect production
- Test copy functionality works correctly
- Verify frontend reads correct environment based on NODE_ENV
- Test that colors are shared but selections are independent