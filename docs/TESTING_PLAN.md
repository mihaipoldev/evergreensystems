# Page-Builder Refactoring - Testing Plan

This document outlines a comprehensive testing plan to verify that all page-builder features have been successfully refactored and are working correctly.

## Pre-Testing Setup

1. **Clear build cache:**
   ```bash
   rm -rf .next
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

---

## Phase 1: Build & Compilation Verification

### 1.1 TypeScript Compilation
- [ ] Run TypeScript check:
  ```bash
  npx tsc --noEmit
  ```
- [ ] Verify: No errors related to page-builder features
- [ ] Note: RAG-related errors are expected and unrelated

### 1.2 Linter Check
- [ ] Check for linter errors:
  ```bash
  npm run lint
  ```
- [ ] Verify: No linter errors in page-builder features

### 1.3 Build Test
- [ ] Run production build:
  ```bash
  npm run build
  ```
- [ ] Verify: Build completes successfully
- [ ] Check for any build warnings related to imports

---

## Phase 2: Admin Interface Testing

### 2.1 Core Page Management
- [ ] Navigate to `/admin/pages`
- [ ] Verify: Pages list loads correctly
- [ ] Click on a page to view sections
- [ ] Verify: Page sections list displays correctly
- [ ] Test creating a new page
- [ ] Test editing an existing page
- [ ] Test deleting a page

### 2.2 Section Management
- [ ] Navigate to `/admin/sections`
- [ ] Verify: Sections list loads correctly
- [ ] Click on a section to edit
- [ ] Verify: Section form loads with all tabs
- [ ] Test creating a new section
- [ ] Test editing section details
- [ ] Test section status changes (published/draft/deactivated)

### 2.3 Content Item Management

#### CTA Buttons
- [ ] Navigate to `/admin/cta`
- [ ] Verify: CTA buttons list loads
- [ ] Test creating a new CTA button
- [ ] Test editing a CTA button
- [ ] Verify: CTA buttons appear in section forms

#### FAQ Items
- [ ] Navigate to `/admin/faq`
- [ ] Verify: FAQ list loads
- [ ] Test creating a new FAQ item
- [ ] Test editing an FAQ item
- [ ] Verify: FAQ items appear in FAQ sections

#### Testimonials
- [ ] Navigate to `/admin/testimonials`
- [ ] Verify: Testimonials list loads
- [ ] Test creating a new testimonial
- [ ] Test editing a testimonial
- [ ] Verify: Testimonials appear in testimonial sections

#### Features
- [ ] Navigate to `/admin/features`
- [ ] Verify: Features list loads
- [ ] Test creating a new feature
- [ ] Test editing a feature
- [ ] Verify: Features appear in feature/offer sections

#### Timeline Items
- [ ] Navigate to `/admin/timeline/new`
- [ ] Test creating a new timeline item
- [ ] Navigate to `/admin/timeline/[id]/edit`
- [ ] Test editing a timeline item
- [ ] Verify: Timeline items appear in timeline sections

#### Results
- [ ] Navigate to `/admin/results/new`
- [ ] Test creating a new result
- [ ] Navigate to `/admin/results/[id]/edit`
- [ ] Test editing a result
- [ ] Verify: Results appear in results sections

### 2.4 Media Library
- [ ] Navigate to `/admin/media`
- [ ] Verify: Media library loads
- [ ] Test uploading new media
- [ ] Test editing media items
- [ ] Verify: Media appears in section media tabs

### 2.5 Supporting Features

#### Site Structure
- [ ] Navigate to `/admin/site-structure`
- [ ] Verify: Site structure page loads
- [ ] Verify: Pages are displayed correctly
- [ ] Test site structure management

#### Social Platforms
- [ ] Navigate to `/admin/social-platforms`
- [ ] Verify: Social platforms list loads
- [ ] Test creating a new social platform
- [ ] Test editing a social platform
- [ ] Verify: Social platforms appear in section tabs

#### Softwares
- [ ] Navigate to `/admin/softwares`
- [ ] Verify: Softwares list loads
- [ ] Test creating a new software
- [ ] Test editing a software
- [ ] Verify: Softwares appear in logos sections

---

## Phase 3: Section Content Tabs Testing

For each section type, verify all content tabs work:

### 3.1 Hero Section
- [ ] Edit a hero section
- [ ] Verify: Details tab works
- [ ] Verify: Media tab works
- [ ] Verify: CTA tab works
- [ ] Test adding/removing media
- [ ] Test adding/removing CTA buttons

### 3.2 Header Section
- [ ] Edit a header section
- [ ] Verify: Details tab works
- [ ] Verify: CTA tab works

### 3.3 FAQ Section
- [ ] Edit an FAQ section
- [ ] Verify: Details tab works
- [ ] Verify: FAQ tab works
- [ ] Test adding FAQ items to section
- [ ] Test reordering FAQ items

### 3.4 Testimonials Section
- [ ] Edit a testimonials section
- [ ] Verify: Details tab works
- [ ] Verify: Testimonials tab works
- [ ] Test adding testimonials to section
- [ ] Test reordering testimonials

### 3.5 Features/Offer Section
- [ ] Edit a features/offer section
- [ ] Verify: Details tab works
- [ ] Verify: Features tab works
- [ ] Test adding features to section
- [ ] Test reordering features

### 3.6 Timeline Section
- [ ] Edit a timeline section
- [ ] Verify: Details tab works
- [ ] Verify: Timeline tab works
- [ ] Test adding timeline items to section
- [ ] Test reordering timeline items

### 3.7 Results Section
- [ ] Edit a results section
- [ ] Verify: Details tab works
- [ ] Verify: Results tab works
- [ ] Test adding results to section

### 3.8 Logos Section
- [ ] Edit a logos section
- [ ] Verify: Details tab works
- [ ] Verify: Softwares tab works
- [ ] Test adding softwares to section

### 3.9 Stories Section
- [ ] Edit a stories section
- [ ] Verify: Details tab works
- [ ] Verify: Media tab works

---

## Phase 4: Public Landing Page Testing

### 4.1 Landing Page Rendering
- [ ] Navigate to `/` (public landing page)
- [ ] Verify: Page loads without errors
- [ ] Check browser console for errors
- [ ] Verify: All sections render correctly

### 4.2 Section Components
- [ ] Verify: Hero section displays with CTA buttons
- [ ] Verify: Header section displays with navigation
- [ ] Verify: Features section displays features
- [ ] Verify: Testimonials section displays testimonials
- [ ] Verify: FAQ section displays FAQ items
- [ ] Verify: Timeline section displays timeline items
- [ ] Verify: Results section displays results
- [ ] Verify: Logos section displays softwares
- [ ] Verify: Stories section displays media
- [ ] Verify: CTA sections display CTA buttons

### 4.3 Interactive Elements
- [ ] Test: CTA button clicks work
- [ ] Test: FAQ accordion expands/collapses
- [ ] Test: Navigation links work
- [ ] Test: Media displays correctly (images/videos)

---

## Phase 5: Import Verification

### 5.1 Verify No Old Imports
- [ ] Search for old import patterns:
  ```bash
  grep -r "@/features/pages" src/
  grep -r "@/features/sections" src/
  grep -r "@/features/media" src/
  grep -r "@/features/cta" src/
  grep -r "@/features/faq" src/
  grep -r "@/features/testimonials" src/
  grep -r "@/features/features" src/
  grep -r "@/features/timeline" src/
  grep -r "@/features/results" src/
  grep -r "@/features/site-structure" src/
  grep -r "@/features/social-platforms" src/
  grep -r "@/features/softwares" src/
  ```
- [ ] Verify: No matches found (except in comments or documentation)

### 5.2 Verify New Imports
- [ ] Search for new import patterns:
  ```bash
  grep -r "@/features/page-builder" src/ | wc -l
  ```
- [ ] Verify: Expected number of imports found

---

## Phase 6: Critical User Flows

### 6.1 Complete Page Creation Flow
1. [ ] Create a new page
2. [ ] Add sections to the page
3. [ ] Add content items to sections (FAQ, Testimonials, etc.)
4. [ ] Publish the page
5. [ ] Verify: Page appears on public site

### 6.2 Content Item Association Flow
1. [ ] Create a content item (e.g., FAQ item)
2. [ ] Associate it with a section
3. [ ] Verify: Item appears in section tab
4. [ ] Reorder items in section
5. [ ] Verify: Order persists

### 6.3 Section Duplication Flow
1. [ ] Duplicate a section with content items
2. [ ] Verify: Content items are duplicated correctly
3. [ ] Edit duplicated section
4. [ ] Verify: Changes don't affect original

---

## Phase 7: Error Handling

### 7.1 Missing Data
- [ ] Test: Section without content items
- [ ] Test: Page without sections
- [ ] Verify: No errors, graceful degradation

### 7.2 Invalid States
- [ ] Test: Editing non-existent section
- [ ] Test: Accessing deleted content item
- [ ] Verify: Proper error messages/404s

---

## Phase 8: Performance Check

### 8.1 Page Load Times
- [ ] Check: Admin pages load within reasonable time
- [ ] Check: Public landing page loads quickly
- [ ] Monitor: No significant performance degradation

### 8.2 Build Performance
- [ ] Note: Build time (should be similar to before)
- [ ] Check: No significant increase in bundle size

---

## Phase 9: Browser Compatibility

### 9.1 Desktop Browsers
- [ ] Test: Chrome
- [ ] Test: Firefox
- [ ] Test: Safari
- [ ] Test: Edge

### 9.2 Mobile Browsers
- [ ] Test: Mobile Chrome
- [ ] Test: Mobile Safari
- [ ] Verify: Responsive design works

---

## Success Criteria

✅ **All tests pass if:**
- TypeScript compiles without page-builder errors
- All admin pages load and function correctly
- Public landing page renders all sections
- No old import paths remain
- All content items can be created, edited, and associated with sections
- No console errors in browser
- Build completes successfully

---

## Rollback Plan (if needed)

If critical issues are found:

1. **Revert git changes:**
   ```bash
   git log --oneline -20  # Find commit before refactoring
   git revert <commit-hash>
   ```

2. **Or reset to previous state:**
   ```bash
   git reset --hard <commit-before-refactoring>
   ```

---

## Notes

- Focus on functionality, not just compilation
- Test with real data when possible
- Check browser console for runtime errors
- Verify database queries still work correctly
- Test both development and production builds

---

## Quick Test Checklist (5-minute smoke test)

If short on time, test these critical paths:

1. [ ] `/admin/pages` - Pages list loads
2. [ ] `/admin/sections` - Sections list loads
3. [ ] `/admin/pages/[id]/sections` - Page sections load
4. [ ] `/admin/sections/[id]` - Section edit page loads
5. [ ] `/` - Public landing page loads
6. [ ] Create one content item (any type)
7. [ ] Associate it with a section
8. [ ] Verify it appears on public page

If all 8 pass, the refactoring is likely successful!

