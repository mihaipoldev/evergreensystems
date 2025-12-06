# Testing Theme Separation

## Quick Test Guide

### Test 1: Verify Independent Theme Storage

1. **Open DevTools** (F12 or Cmd+Option+I)
2. **Go to Application/Storage tab → Local Storage**
3. You should see two separate theme keys:
   - `public-theme` - Controls public/landing page theme
   - `admin-theme` - Controls admin panel theme

### Test 2: Change Themes Independently

#### Step 1: Test Public Theme
1. Open: `http://localhost:3000/` (landing page)
2. Click the theme toggle in the navbar (moon/sun icon)
3. Theme should switch between light/dark
4. **Check DevTools:** `public-theme` value should change

#### Step 2: Test Admin Theme
1. Open: `http://localhost:3000/admin` (admin panel)
2. Click the theme toggle in the admin header
3. Theme should switch between light/dark
4. **Check DevTools:** `admin-theme` value should change

#### Step 3: Verify Independence
1. Set **public theme to DARK** (on landing page)
2. Navigate to `/admin`
3. Admin should still be in **default LIGHT** theme (unless you changed it)
4. Now toggle **admin theme to DARK**
5. Navigate back to `/` (landing page)
6. Landing should still be **DARK** (preserved)

### Test 3: Persistence Test

1. Set different themes:
   - Public page: DARK
   - Admin panel: LIGHT
2. **Refresh the browser** (F5)
3. Both sections should maintain their individual themes
4. **Close and reopen browser**
5. Themes should still persist independently

### Test 4: localStorage Inspection

Open DevTools Console and run:

```javascript
// Check current theme values
console.log('Public Theme:', localStorage.getItem('public-theme'));
console.log('Admin Theme:', localStorage.getItem('admin-theme'));

// Manually set themes (for testing)
localStorage.setItem('public-theme', 'dark');
localStorage.setItem('admin-theme', 'light');

// Then refresh the page to see the effect
location.reload();
```

### Expected Results

✅ **Public and Admin themes are completely independent**
- Changing one doesn't affect the other
- Each has its own localStorage key
- Each persists separately

✅ **Theme toggles work correctly**
- Public navbar toggle controls public theme only
- Admin header toggle controls admin theme only
- Visual changes are immediate

✅ **Persistence works**
- Themes survive page refreshes
- Themes survive browser restarts
- Each section remembers its preference

### Common Issues & Solutions

**Issue:** Both themes still changing together
- **Solution:** Clear localStorage completely and try again:
  ```javascript
  localStorage.clear();
  location.reload();
  ```

**Issue:** Theme toggle not visible
- **Solution:** Wait for component to mount (it has a loading state)

**Issue:** Wrong theme on page load
- **Solution:** Check which layout is wrapping the page
  - Public pages should be in `(public)` route group
  - Admin pages should be under `admin` route

---

## Visual Verification

### Expected localStorage State

When both sections have different themes:

```json
{
  "public-theme": "dark",
  "admin-theme": "light"
}
```

### Navigation Test Flow

```
1. / (Landing - Dark) → Toggle → / (Landing - Light)
2. Navigate to /admin → (Admin - Dark by default)
3. Toggle admin → (Admin - Light)
4. Navigate back to / → (Landing - Still Light!)
5. Refresh browser → Both themes persist!
```

---

## Debug Commands

If you need to debug theme issues:

```javascript
// See all theme-related localStorage
Object.keys(localStorage).filter(k => k.includes('theme'));

// Reset both themes to light
localStorage.setItem('public-theme', 'light');
localStorage.setItem('admin-theme', 'light');
location.reload();

// Reset both themes to dark
localStorage.setItem('public-theme', 'dark');
localStorage.setItem('admin-theme', 'dark');
location.reload();

// Clear all themes (reset to defaults)
localStorage.removeItem('public-theme');
localStorage.removeItem('admin-theme');
location.reload();
```

---

## Success Criteria

✅ Two separate localStorage keys exist
✅ Changing public theme doesn't affect admin
✅ Changing admin theme doesn't affect public
✅ Both themes persist across refreshes
✅ Both themes persist across browser sessions
✅ Default theme is 'light' for both sections
✅ Theme toggles are visible and functional
