# Intel App - Complete Feature Report

## Overview
The Intel App is a RAG (Retrieval Augmented Generation) management system for organizing knowledge bases, projects, documents, runs, and reports. It provides a comprehensive interface for managing AI-powered knowledge systems.

## Navigation Structure

### Sidebar Navigation
The app uses a collapsible sidebar with the following main sections:

1. **Dashboard** (`/intel/dashboard`) - Overview and quick actions
2. **Knowledge Bases** (`/intel/knowledge-bases`) - Manage knowledge bases
3. **Projects** (`/intel/projects`) - Manage client projects
4. **Documents** (`/intel/documents`) - View all documents across knowledge bases
5. **Runs** (`/intel/runs`) - View API execution runs
6. **Reports** (`/intel/reports`) - View generated reports
7. **Admin** (`/admin`) - Link to admin panel
8. **Settings** (`/intel/settings`) - User settings (Account & Appearance)

**Note**: Knowledge Bases section has a collapsible submenu showing:
- "All Knowledge Bases" link
- Individual knowledge base links (alphabetically sorted)

---

## 1. Dashboard (`/intel/dashboard`)

### Overview
The dashboard provides a high-level overview of the system with statistics and quick access to recent items.

### Features & Buttons

#### Statistics Cards (4 cards)
- **Knowledge Bases** - Total count of knowledge bases
- **Active Projects** - Count of active projects
- **Documents** - Total document count
- **API Calls (24h)** - Runs from last 24 hours

#### Quick Action Buttons (3 buttons)
1. **"New Knowledge Base"** (Primary button)
   - Navigates to `/intel/knowledge-bases/new`
   - Creates a new knowledge base

2. **"New Project"** (Outline button)
   - Navigates to `/intel/projects/new`
   - Creates a new project

3. **"Generate Report"** (Disabled - Coming Soon)
   - Currently disabled
   - Future feature for report generation

#### Recent Sections (4 sections)
Each section shows the 3 most recent items with a "View all" link:

1. **Recent Knowledge Bases**
   - Shows 3 most recent knowledge bases
   - "View all" → `/intel/knowledge-bases`
   - Empty state: "No knowledge bases. Create one" with link

2. **Active Projects**
   - Shows 3 active projects
   - "View all" → `/intel/projects`
   - Empty state: "No active projects. Create one" with link

3. **Recent Documents**
   - Shows 3 most recently created documents
   - "View all" → `/intel/documents`
   - Empty state: "No documents. Create a knowledge base" with link

4. **Recent Runs**
   - Shows 3 most recent runs
   - "View all" → `/intel/runs`
   - Empty state: "No runs yet."

### Flow
1. User lands on dashboard after `/intel` redirect
2. Dashboard fetches data from multiple APIs in parallel
3. Displays statistics and recent items
4. Quick actions allow immediate creation of KBs or projects

---

## 2. Knowledge Bases (`/intel/knowledge-bases`)

### Overview
Main page for managing knowledge bases. Supports both grid and table views.

### Features & Buttons

#### Toolbar Actions
1. **Search Bar** - Search by name or description
2. **Filter Menu** - Filter by:
   - **Type**: Niche Intelligence, Contact Support, Internal Operations, Project, Client
   - **Active Status**: Active, Inactive
   - **Visibility**: Public, Private
3. **Sort Options**: Recent, Name, Size (document count)
4. **View Mode Toggle**: Grid view / Table view
5. **Show Projects Toggle** - Toggle to show/hide project-type knowledge bases (persisted in localStorage)
6. **"New" Button** - Opens create knowledge base modal

#### Knowledge Base Actions (per KB)
Each knowledge base card/row has:
- **Click** - Navigate to detail page (`/intel/knowledge-bases/[id]`)
- **Actions Menu** (3-dot menu):
  - **Edit** - Opens edit modal
  - **Delete** - Opens delete confirmation dialog

#### Knowledge Base Modal (Create/Edit)
**Fields:**
- **Name** (required) - Text input
- **Type** (required) - Dropdown:
  - Niche Intelligence
  - Contact Support
  - Internal Operations
  - Project
  - Client
- **Description** (optional) - Textarea
- **Visibility** - Radio buttons:
  - Private (default) - Only team members
  - Public - Anyone with link
- **Active Status** - Toggle switch (default: ON)

**Buttons:**
- **Cancel** - Closes modal
- **Create/Update Knowledge Base** - Submits form

### Knowledge Base Detail Page (`/intel/knowledge-bases/[id]`)

#### Header Section
- Description text
- Badges showing:
  - KB Type
  - Visibility (Public/Private)
  - Active Status (Active/Inactive)
- **Actions Menu** (3-dot menu):
  - Edit
  - Delete

#### Statistics Cards (3 cards)
- **Total Documents** - Count of documents in this KB
- **Total Chunks** - Sum of all chunk counts
- **Total Runs** - Count of runs for this KB

#### Additional Status Cards (conditional)
- **Processing** - Shows if documents are processing
- **Failed** - Shows if documents failed

#### Documents Section
- Full document list for this knowledge base
- Real-time updates via Supabase subscriptions

### Flow
1. User navigates to knowledge bases list
2. Can search, filter, and sort
3. Click KB card → Detail page
4. On detail page, can view documents and stats
5. Can edit/delete from detail page or list page

---

## 3. Projects (`/intel/projects`)

### Overview
Manage client projects that can be linked to knowledge bases.

### Features & Buttons

#### Toolbar Actions
1. **Search Bar** - Search by client name or description
2. **Filter Menu** - Filter by:
   - **Status**: Active, Onboarding, Delivered, Archived
   - **Client Name**: Dynamic list from existing projects
3. **Sort Options**: Recent, Name
4. **View Mode Toggle**: Grid view / Table view
5. **"New" Button** - Opens create project modal

#### Project Actions (per project)
- **Click** - Navigate to detail page (`/intel/projects/[id]`)
- **Actions Menu** (3-dot menu):
  - Edit
  - Delete

#### Project Modal (Create/Edit)
**Fields:**
- **Client Name** (required) - Text input
- **Description** (optional) - Textarea
- **Status** (required) - Dropdown:
  - Active
  - Onboarding
  - Delivered
  - Archived
- **Linked Knowledge Base** (optional) - Dropdown to select KB

**Buttons:**
- **Cancel**
- **Create/Update Project**

### Project Detail Page (`/intel/projects/[id]`)

#### Header Section
- Description text
- Badges showing:
  - Status
  - Linked Knowledge Base name (if linked)
- **Actions Menu**:
  - Edit
  - Delete

#### Statistics Cards (3 cards)
- **Total Documents** - Count of documents in this project
- **Total Chunks** - Sum of all chunk counts
- **Total Runs** - Count of runs for linked KB

#### Additional Status Cards (conditional)
- **Processing** - Documents currently processing
- **Failed** - Documents that failed

#### Documents Section
- Shows documents linked to this project
- Can link/unlink documents from projects

### Flow
1. User navigates to projects list
2. Can search, filter, and sort
3. Click project card → Detail page
4. On detail page, can view linked documents and stats
5. Can edit/delete from detail page or list page

---

## 4. Documents (`/intel/documents`)

### Overview
View and manage all documents across all knowledge bases. Supports grouping by workspace/linked.

### Features & Buttons

#### Toolbar Actions
1. **Search Bar** - Search by title, content, or knowledge base name
2. **Filter Menu** - Filter by:
   - **Source Type**: Dynamic list from existing documents
   - **Content Type**: Dynamic list from existing documents
   - **Status**: Ready, Processing, Failed, Completed
   - **Should Chunk**: Yes, No
3. **Sort Options**: Recent, Title, Chunk Count, File Size
4. **View Mode Toggle**: Grid view / Table view
5. **Group by Source Toggle** - Group documents by workspace vs linked (when in project context)
6. **"Add" Button** - Opens document upload modal

#### Document Actions (per document)
- **View** - View document content
- **Download** - Download document file
- **Delete** - Delete document (with confirmation)

#### Document Modal (Add Document)
**Source Type Selection:**
1. **File Upload**
   - Drag & drop or file picker
   - Supported: PDF, TXT, MD
   - Max size: 20MB
   - File preview with remove option

2. **URL**
   - URL input field
   - Fetches content from URL

3. **Text**
   - Textarea for direct text input

4. **Link** (only available when `projectId` is provided)
   - Shows document selection list
   - Search and filter documents
   - Group by knowledge base
   - Checkbox selection
   - View document content before linking

**Common Fields:**
- **Knowledge Base** (required) - Dropdown (if not pre-selected)
- **Should Chunk** - Toggle switch (default: ON)

**Buttons:**
- **Cancel**
- **Add Document** / **Link Documents**

### Document Detail Features
- **Status Badges**: Ready, Processing, Failed, Completed
- **Chunk Count**: Shows number of chunks if chunking enabled
- **Knowledge Base Name**: Shows which KB document belongs to
- **Content Viewer**: Modal to view full document content

### Flow
1. User navigates to documents list
2. Can search, filter, sort, and group
3. Click "Add" → Choose source type
4. Upload/link document → Document appears in list
5. Real-time updates via Supabase subscriptions
6. Can view, download, or delete documents

---

## 5. Runs (`/intel/runs`)

### Overview
View execution history of API calls and document processing runs.

### Features & Buttons

#### Toolbar Actions
1. **Search Bar** - Search by knowledge base name, run type, or status
2. **Filter Menu** - Filter by:
   - **Run Type**: Niche Intelligence, KB Query, Document Ingest
   - **Status**: Queued, Collecting, Ingesting, Generating, Complete, Failed
3. **Sort Options**: Recent, Knowledge Base
4. **View Mode Toggle**: Grid view / Table view (table is default)

#### Run Information Displayed
- **Run Type** - Type of run
- **Knowledge Base** - Associated KB name
- **Status** - Current status with color coding
- **Created At** - Timestamp
- **Details** - Additional run information

### Flow
1. User navigates to runs list
2. Can search, filter, and sort
3. View run history and status
4. Runs are created automatically by the system

---

## 6. Reports (`/intel/reports`)

### Overview
View generated reports from runs.

### Features & Buttons

#### Toolbar Actions
1. **Search Bar** - Search reports
2. **Filter Menu** - Filter options (implementation may vary)
3. **Sort Options** - Sort options (implementation may vary)
4. **View Mode Toggle** - Grid/Table view

#### Report Information
- **Run Information** - Associated run details
- **Report Content** - Generated report content
- **Created At** - Timestamp

### Flow
1. User navigates to reports list
2. Can search, filter, and sort
3. View report details
4. Reports are generated from runs

---

## 7. Settings (`/intel/settings`)

### Overview
User account and appearance settings.

### Features & Buttons

#### Sections (Tabs on mobile, Sidebar on desktop)
1. **Account**
   - User account settings
   - Profile information

2. **Appearance**
   - Theme preferences
   - UI customization

#### Navigation
- **Mobile**: Tab navigation at top
- **Desktop**: Sidebar navigation on left
- Active section persisted in localStorage

### Flow
1. User navigates to settings
2. Selects section (Account or Appearance)
3. Makes changes
4. Settings are saved

---

## Real-Time Features

### Supabase Real-Time Subscriptions
The app uses Supabase real-time subscriptions for:

1. **Knowledge Bases**
   - INSERT, UPDATE, DELETE events
   - Auto-updates list when KBs are created/modified

2. **Documents**
   - INSERT, UPDATE, DELETE events
   - Auto-updates list when documents are added/modified
   - Status changes reflected in real-time
   - Works on both main documents page and KB detail pages

### Benefits
- No manual refresh needed
- Status updates appear automatically
- New documents appear immediately
- Processing status updates in real-time

---

## Common UI Patterns

### Modals
- **KnowledgeBaseModal** - Create/Edit KB
- **ProjectModal** - Create/Edit Project
- **DocumentModal** - Add/Link Documents
- **DeleteConfirmationDialog** - Confirm deletions

### Drawers
- **RAGDrawer** - Side drawer for document content viewing
- **DocumentContentDrawer** - View document content

### Cards
- **StatCard** - Statistics display
- **KnowledgeBaseCardCompact** - Compact KB card
- **ProjectCardCompact** - Compact project card
- **DocumentCardCompact** - Compact document card
- **RunCardCompact** - Compact run card

### Toolbars
- **Toolbar** - Standard toolbar with search, filters, sort, view mode
- Consistent across all list pages

---

## Data Flow

### Knowledge Base Flow
1. Create KB → Modal → API → Database
2. Edit KB → Modal → API → Database → Real-time update
3. Delete KB → Confirmation → API → Database → Real-time update
4. View KB → Detail page → Fetch documents → Display

### Document Flow
1. Add Document → Modal → Choose source → API → Database → Real-time update
2. Link Document → Modal → Select documents → API → Database → Real-time update
3. Delete Document → Confirmation → API → Database → Real-time update
4. View Document → Drawer → Display content

### Project Flow
1. Create Project → Modal → API → Database
2. Edit Project → Modal → API → Database
3. Link KB to Project → Edit modal → API → Database
4. Link Documents → Document modal → Select → API → Database

---

## Key Features Summary

### ✅ Implemented Features
- Knowledge base management (CRUD)
- Project management (CRUD)
- Document management (upload, link, delete, view)
- Multiple document sources (file, URL, text, link)
- Real-time updates via Supabase
- Search and filtering
- Multiple view modes (grid/table)
- Statistics and analytics
- Run tracking
- Report viewing
- Settings management
- Responsive design (mobile/desktop)
- Collapsible sidebar navigation

### 🚧 Coming Soon
- Generate Report feature (disabled on dashboard)

---

## Technical Notes

### Authentication
- Uses Supabase authentication
- Access tokens passed in API requests
- Session management via Supabase client

### State Management
- React hooks for local state
- Real-time subscriptions for live updates
- localStorage for preferences (view mode, show projects toggle)

### API Endpoints
- `/api/intel/knowledge-base` - KB operations
- `/api/intel/projects` - Project operations
- `/api/intel/documents` - Document operations
- `/api/intel/runs` - Run operations
- `/api/intel/reports` - Report operations

### Performance
- Parallel API calls on dashboard
- Memoized filtering and sorting
- Optimistic UI updates
- Real-time subscriptions for instant feedback

---

## User Journey Examples

### Creating a Knowledge Base
1. Navigate to Dashboard or Knowledge Bases
2. Click "New Knowledge Base" or "New" button
3. Fill in form (name, type required)
4. Set visibility and active status
5. Click "Create Knowledge Base"
6. Redirected to KB detail page
7. KB appears in sidebar navigation

### Adding Documents
1. Navigate to Knowledge Base detail page
2. Click "Add" button in documents section
3. Choose source type (file/URL/text/link)
4. If file: drag & drop or select file
5. Select knowledge base (if not pre-selected)
6. Toggle chunking if needed
7. Click "Add Document"
8. Document appears in list with "processing" status
9. Status updates to "ready" when complete (real-time)

### Linking Documents to Project
1. Navigate to Project detail page
2. Click "Add" button in documents section
3. Select "Link" source type
4. Search/filter documents
5. Select documents via checkboxes
6. Click "Link Documents"
7. Documents appear in project's document list

---

*Report generated: 2024*
*Intel App Version: Current*

