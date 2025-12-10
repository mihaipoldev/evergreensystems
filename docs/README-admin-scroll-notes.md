Admin Header & Scroll Fix (Admin Area)
======================================

What was fixed
--------------
- The admin header was not sticking on mobile/desktop and double-scroll appeared.
- Horizontal scroll sometimes showed up due to nested overflow containers.

Key layout changes
------------------
- Admin header is fixed to the top: `position: fixed; top: 0; left: 0; right: 0; z-30`.
- Added top padding to content to offset the fixed header: `pt-[88px]` on the content wrapper.
- Single scroll area: removed nested `overflow-y-auto` on main wrappers and let the page scroll normally.
- Prevented horizontal scroll: set `overflow-x-hidden` and `min-w-0` on wrappers and main content containers.
- Sidebar remains fixed on desktop (no change to its behavior).

Files touched (for reference)
-----------------------------
- `src/app/admin/layout.tsx`: structure/overflow and content padding beneath header.
- `src/components/admin/AdminHeader.tsx`: fixed positioning, backdrop, border.

If applying to another project
------------------------------
1) Make the header fixed and give content a top padding equal to header height.
2) Avoid nested scroll areas; let the body/main handle vertical scrolling.
3) Add `overflow-x-hidden` and `min-w-0` to main wrappers to prevent horizontal scroll.
4) Keep sidebars fixed via their own positioning; do not wrap them in scrolling parents.
