# Ar-Rahnu Islamic Pawn Broking System - Design Guidelines

## Design Approach: Enterprise Financial System with Islamic Cultural Elements

**Selected Framework**: Material Design with Islamic cultural customization for enterprise financial management
**Justification**: Information-dense financial application requiring clarity, consistency, and cultural sensitivity. Material Design provides robust patterns for data tables, forms, and complex workflows while allowing cultural customization.

---

## Core Design Principles

1. **Trust & Transparency**: Clear visual hierarchy and honest data presentation reflecting Shariah values
2. **Operational Efficiency**: Streamlined workflows for high-volume daily transactions
3. **Cultural Respect**: Subtle Islamic design elements without compromising functionality
4. **Data Clarity**: Information-first approach with minimal decorative elements

---

## Color Palette

### Light Mode
- **Primary**: 158 45% 35% (Deep Islamic green - main actions, navigation)
- **Primary Hover**: 158 45% 28%
- **Secondary**: 45 65% 50% (Muted gold - accents, success states)
- **Background**: 0 0% 98% (Warm off-white)
- **Surface**: 0 0% 100% (Pure white for cards, modals)
- **Border**: 0 0% 88%
- **Text Primary**: 0 0% 15%
- **Text Secondary**: 0 0% 45%
- **Warning**: 35 90% 55% (Maturity alerts)
- **Error**: 0 70% 50% (Defaults, critical actions)
- **Success**: 158 55% 45% (Redemptions, approvals)

### Dark Mode
- **Primary**: 158 55% 55% (Lighter green for dark backgrounds)
- **Primary Hover**: 158 55% 62%
- **Secondary**: 45 60% 60% (Softer gold)
- **Background**: 0 0% 10%
- **Surface**: 0 0% 14%
- **Border**: 0 0% 22%
- **Text Primary**: 0 0% 95%
- **Text Secondary**: 0 0% 65%

---

## Typography

### Font Families
- **Primary**: Inter (Google Fonts) - UI elements, body text, data tables
- **Headings**: Poppins (Google Fonts) - section headers, page titles
- **Accent**: Amiri (Google Fonts) - Arabic calligraphy for cultural elements (sparingly)

### Type Scale
- **Display**: text-4xl font-semibold (Dashboard headlines, page titles)
- **H1**: text-3xl font-semibold (Module headers)
- **H2**: text-2xl font-medium (Section headers)
- **H3**: text-xl font-medium (Card headers, form sections)
- **Body**: text-base (Forms, tables, content)
- **Small**: text-sm (Labels, meta information)
- **Micro**: text-xs (Timestamps, helper text)

### Financial Data Display
- **Currency Values**: text-2xl font-bold tabular-nums (Loan amounts, valuations)
- **Table Numbers**: text-sm font-medium tabular-nums (Consistent alignment)

---

## Layout System

### Spacing Primitives
**Core Units**: 2, 4, 8, 12, 16, 24 (Tailwind scale)
- Component padding: p-4 to p-6
- Section spacing: space-y-8 or space-y-12
- Card margins: gap-4 or gap-6 in grids
- Form field spacing: space-y-4

### Grid System
- **Dashboard**: 12-column grid with gap-6
- **Data Tables**: Full-width with horizontal scroll on mobile
- **Forms**: 2-column layout (lg:grid-cols-2) collapsing to single column on mobile
- **Cards**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for stats/metrics

### Container Widths
- **Full Dashboard**: max-w-7xl mx-auto
- **Forms/Details**: max-w-4xl mx-auto
- **Modals**: max-w-2xl

---

## Component Library

### Navigation
- **Top Navigation Bar**: Fixed header with logo (left), breadcrumbs (center), user menu (right)
- **Sidebar**: Collapsible left sidebar with icon + text menu items, role-based visibility
- **Breadcrumbs**: Always visible for deep navigation (Home > Customers > Transaction Details)

### Data Display
- **Tables**: Striped rows, sortable columns, sticky headers, pagination, row actions menu
- **Cards**: Elevated shadow (shadow-md), rounded-lg, white/surface background
- **Stats Cards**: Large number display with icon, trend indicator, and comparison text
- **Status Badges**: Pill-shaped with semantic colors (Active/green, Matured/orange, Defaulted/red, Redeemed/blue)

### Forms
- **Input Fields**: Labeled with floating labels, helper text below, error states with red border and message
- **Select Dropdowns**: Native select with custom styling
- **Date Pickers**: Calendar widget for maturity dates, transaction dates
- **File Upload**: Drag-and-drop zone for IC scans, signatures, gold photos
- **Search Bars**: Prominent with magnifying glass icon, real-time filtering

### Actions
- **Primary Button**: bg-primary text-white rounded-md px-6 py-2.5 hover:bg-primary-hover
- **Secondary Button**: border border-primary text-primary bg-transparent
- **Danger Button**: bg-error text-white (for deletions, auction initiation)
- **Icon Buttons**: Circular, minimal for table actions (edit, view, delete)

### Overlays
- **Modals**: Centered overlay with backdrop blur, max-w-2xl, used for confirmations and quick forms
- **Drawer**: Slide-in from right for detailed record views (customer profile, transaction history)
- **Toast Notifications**: Top-right corner, auto-dismiss, semantic colors

### Islamic Cultural Elements
- **Subtle Pattern Overlays**: Very light Islamic geometric patterns on header backgrounds (opacity: 0.05)
- **Section Dividers**: Thin decorative lines with small geometric motifs at intersections
- **Certificate Headers**: Arabic calligraphy "بسم الله الرحمن الرحيم" (Bismillah) on Rahn contract PDFs
- **Corner Accents**: Small geometric corner decorations on important cards (gold valuation summary, contract cards)

---

## Animations

**Minimize Distractions** - Use only for feedback and transitions:
- **Hover States**: Subtle scale (scale-105) on cards, color transitions (duration-200)
- **Loading States**: Spinning loader for async operations, skeleton screens for tables
- **Modal Entrance**: Fade-in with slight scale (from 95% to 100%) over 200ms
- **Toast Notifications**: Slide-in from top-right
- **NO**: Parallax, scroll-triggered animations, or autoplay effects

---

## Module-Specific Layouts

### Dashboard (Landing Page)
- **Top Stats Row**: 4 metric cards (Total Active Pawns, Outstanding Amount, Items Maturing This Week, Monthly Revenue)
- **Charts Section**: 2-column grid (Loan Volume Trend line chart, Gold Inventory pie chart)
- **Recent Activity Table**: Last 10 transactions with quick actions
- **Alerts Panel**: Sticky right sidebar showing maturity warnings, pending approvals

### Customer Management
- **Search + Filter Bar**: Top-aligned with customer name/IC search, status filter, branch filter
- **Customer Grid**: Card-based layout with photo, name, IC, active loan count, quick view button
- **Customer Detail View**: Drawer with tabs (Profile, Active Loans, Transaction History, Documents)

### Pawn Transaction Flow
- **Multi-Step Form**: Progress indicator at top, 4 steps (Customer Selection, Gold Valuation, Loan Terms, Contract Generation)
- **Gold Valuation Step**: Live gold price display in highlighted box, karat selector, weight input, auto-calculated value preview
- **Contract Preview**: PDF viewer embedded with signature pad below

### Loan Ledger
- **Filter Controls**: Date range picker, branch selector, status filter in a sticky top bar
- **Table View**: Sortable columns (Customer, Pledge Date, Amount, Maturity, Status), expandable rows for payment history
- **Bulk Actions**: Checkbox selection with action dropdown (Send Reminders, Export)

### Vault Management
- **Vault Map**: Visual grid showing vault sections, color-coded by occupancy
- **Item List**: Table with barcode/RFID, customer link, location, audit timestamp
- **Movement Log**: Timeline view of transfers between vaults

---

## Responsive Breakpoints
- **Mobile (< 768px)**: Single column, hamburger menu, simplified tables (card view)
- **Tablet (768px - 1024px)**: 2-column grids, visible sidebar
- **Desktop (> 1024px)**: Full layout with 3-column grids where appropriate

---

## Images

### No Hero Images
This is a utility-focused enterprise application - no marketing hero sections. Instead:
- **Logo/Branding**: Islamic geometric pattern logo in header
- **Customer Photos**: Small circular avatars in customer cards and transaction records
- **Gold Item Photos**: Thumbnail previews in valuation forms and vault inventory (click to enlarge)
- **Document Scans**: IC photos, signature images displayed in document management modals
- **Empty States**: Simple SVG illustrations for "No active loans," "Vault empty" states

All images functional, none decorative.