# PAYTAX-109: Implementation Strategy - Avoiding Duplication

**Date:** November 9, 2025  
**Status:** Planning Phase  
**Goal:** Build proper page architecture WITHOUT duplicating existing work

---

## 🔍 Existing Components Audit

### **What We Already Have (DO NOT DUPLICATE)**

#### **1. SimpleHero.tsx** ✅
**Location:** `src/components/molecules/SimpleHero.tsx`  
**Purpose:** Homepage hero with parallax, animations, CTA  
**Usage:** Homepage only (HomePageContent.tsx)  
**Features:**
- Framer Motion parallax
- GlowButton CTA
- Feature list
- Design tokens ✅
- Has tests ✅

**Decision:** **KEEP** - This is homepage-specific with special animations

---

#### **2. CallToAction.tsx** ✅
**Location:** `src/components/molecules/CallToAction.tsx`  
**Purpose:** CTA sections with variants (contact, newsletter, calculator)  
**Usage:** Currently in `/components/molecules` (should be used by pages!)  
**Features:**
- 3 variants
- Dual action buttons
- Icon + title + description
- Design tokens ✅
- Has tests ✅

**Decision:** **KEEP & USE** - This is exactly what we need for CTAs!

---

#### **3. ContentSection.tsx** ✅
**Location:** `src/components/molecules/ContentSection.tsx`  
**Purpose:** Generic content wrapper with heading
**Usage:** Unknown (check usage)
**Features:**
- Container + heading + children pattern
- Design tokens ✅
- Has tests ✅

**Decision:** **CHECK USAGE** - Might overlap with SectionHeading

---

### **Validation Infrastructure** ✅

**Existing:**
```
src/lib/validation/
├── atomsValidation.ts        ✅ 3 schemas
├── moleculesValidation.ts    ✅ 2 schemas (FeedbackForm, CategoryFilter)
├── uiValidation.ts           ✅ 9 schemas
└── __tests__/                ✅ Tests exist
```

**Total:** 14 existing validation schemas

**Decision:** **EXTEND, DON'T REPLACE**
- Add to `moleculesValidation.ts` for molecule props
- Create `pageDataValidation.ts` for page content arrays

---

## ✅ What We Actually Need to Build

### **Core Molecules (New - No Duplication)**

#### **1. PageHero** ✅ CREATED
**Status:** Already created  
**File:** `src/components/molecules/PageHero.tsx`  
**Test:** `src/components/molecules/__tests__/PageHero.test.tsx`  
**Purpose:** Generic page hero (NOT homepage - that's SimpleHero)  
**Usage:** about, privacy, compliance, blog category pages

**Next:** Run test to verify it works

---

#### **2. StatsGrid** ⏳ TO CREATE
**Purpose:** Grid of stat cards with icon + value + label  
**Usage:** about (4 stats), privacy (4 principles), compliance (3 sections)  
**Features:**
- Configurable columns (2, 3, 4)
- Icon + value + label + optional description
- Gradient backgrounds
- Hover effects

**Does NOT duplicate:** Nothing - this pattern doesn't exist yet

---

#### **3. SectionHeading** ⏳ TO CREATE  
**Purpose:** Reusable section headings (badge + title + subtitle)  
**Usage:** ALL pages (repeated 20+ times)  
**Features:**
- Optional badge
- Title (supports GradientText)
- Optional subtitle
- Alignment options

**Potential overlap:** ContentSection.tsx - need to check usage

---

#### **4. FeatureCard** ⏳ TO CREATE
**Purpose:** Individual feature card with icon, title, description, optional metric/link  
**Usage:** about (6 features), privacy (analytics/cookies)  
**Features:**
- Icon with gradient background
- Optional metric display
- Optional CTA link
- Multiple variants

**Does NOT duplicate:** CallToAction is different (dual buttons, specific variants)

---

#### **5. FeatureGrid** ⏳ TO CREATE
**Purpose:** Grid wrapper for FeatureCard with section heading  
**Usage:** about, privacy  
**Features:**
- SectionHeading integration
- 2 or 3 column layouts
- Responsive

**Does NOT duplicate:** Nothing

---

#### **6. ContactFooter** ⏳ TO CREATE
**Purpose:** Contact section with links  
**Usage:** about, privacy, compliance  
**Features:**
- Heading + description
- Link list with separators
- Email/link types

**Does NOT duplicate:** Nothing - footer molecules are navigation-specific

---

### **Specialized Molecules (New)**

#### **7. ComparisonCards** ⏳ TO CREATE
**Purpose:** Side-by-side "Do/Don't" comparison  
**Usage:** privacy page only  
**Features:**
- Two cards (positive/negative)
- Icon + title + list items
- Color coding

**Does NOT duplicate:** Nothing

---

#### **8. DataFlowCards** ⏳ TO CREATE
**Purpose:** 3-column data flow explanation  
**Usage:** privacy page only  
**Features:**
- Icon + title + description
- 3-column layout
- Color-coded icons

**Does NOT duplicate:** Nothing

---

#### **9. TechStackSection** ⏳ TO CREATE
**Purpose:** Tech metrics + technology badges  
**Usage:** about page only  
**Features:**
- Metric cards
- Tech badge list
- Section heading

**Does NOT duplicate:** Nothing

---

#### **10. StorySection** ⏳ TO CREATE
**Purpose:** Long-form content with icon + heading + paragraphs  
**Usage:** about, privacy  
**Features:**
- Icon
- Heading (supports GradientText)
- Multiple paragraphs
- Card wrapper

**Does NOT duplicate:** ContentSection is simpler

---

## 🔧 Components to Check Before Building

### **ContentSection.tsx Usage Check**

<function_calls>
<invoke name="Grep">
<parameter name="pattern">ContentSection
