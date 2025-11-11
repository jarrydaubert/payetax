#!/bin/bash
# Create all PAYTAX-108 sub-issues
# Run from project root: bash scripts/create-audit-subissues.sh

set -e

PARENT="PAYTAX-108"
PROJECT="PayeTax"

echo "🚀 Creating audit sub-issues for $PARENT..."
echo ""

# System 1: Theme System (4 sub-issues)
echo "📦 System 1: Theme System"
node scripts/linear.js create "Theme System: Audit Calculator Components (Input forms, Results, Charts)"
node scripts/linear.js set-parent PAYTAX-110 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-110

node scripts/linear.js create "Theme System: Audit Content Components (Blog, MDX, Pages)"
node scripts/linear.js set-parent PAYTAX-111 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-111

node scripts/linear.js create "Theme System: Audit Utility Components (Badges, Buttons, Cards, Dialogs)"
node scripts/linear.js set-parent PAYTAX-112 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-112

echo "✅ Theme System: 4 issues created (PAYTAX-109 to 112)"
echo ""

# System 2: Design Tokens (5 sub-issues)
echo "📦 System 2: Design Tokens"
node scripts/linear.js create "Design Tokens: Typography System Audit (text-*, font-*, leading-*)"
node scripts/linear.js set-parent PAYTAX-113 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-113

node scripts/linear.js create "Design Tokens: Spacing System Audit (gap-*, space-*, p-*, m-*)"
node scripts/linear.js set-parent PAYTAX-114 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-114

node scripts/linear.js create "Design Tokens: Icon Sizing System Audit (size-*, h-*, w-*)"
node scripts/linear.js set-parent PAYTAX-115 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-115

node scripts/linear.js create "Design Tokens: Gradient System Audit (bg-gradient-*)"
node scripts/linear.js set-parent PAYTAX-116 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-116

node scripts/linear.js create "Design Tokens: Layout System Audit (container, max-width, responsive)"
node scripts/linear.js set-parent PAYTAX-117 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-117

echo "✅ Design Tokens: 5 issues created (PAYTAX-113 to 117)"
echo ""

# System 3: Zod Validation (4 sub-issues)
echo "📦 System 3: Zod Validation"
node scripts/linear.js create "Zod Validation: Component Props Validation (UI components)"
node scripts/linear.js set-parent PAYTAX-118 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-118

node scripts/linear.js create "Zod Validation: Calculator Validation (Input forms, state)"
node scripts/linear.js set-parent PAYTAX-119 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-119

node scripts/linear.js create "Zod Validation: Config & Constants Validation (blog.config, tooltips)"
node scripts/linear.js set-parent PAYTAX-120 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-120

node scripts/linear.js create "Zod Validation: Environment & External Data Validation"
node scripts/linear.js set-parent PAYTAX-121 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-121

echo "✅ Zod Validation: 4 issues created (PAYTAX-118 to 121)"
echo ""

# System 4: Atomic Design (5 sub-issues)
echo "📦 System 4: Atomic Design"
node scripts/linear.js create "Atomic Design: Audit /ui Folder (Move custom components out)"
node scripts/linear.js set-parent PAYTAX-122 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-122

node scripts/linear.js create "Atomic Design: Audit /atoms Folder (25 components - split into groups)"
node scripts/linear.js set-parent PAYTAX-123 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-123

node scripts/linear.js create "Atomic Design: Audit /molecules Folder (38 components - categories)"
node scripts/linear.js set-parent PAYTAX-124 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-124

node scripts/linear.js create "Atomic Design: Audit /organisms Folder (Calculator, Charts, Comparison)"
node scripts/linear.js set-parent PAYTAX-125 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-125

node scripts/linear.js create "Atomic Design: Audit /templates & /pages (Layout consistency)"
node scripts/linear.js set-parent PAYTAX-126 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-126

echo "✅ Atomic Design: 5 issues created (PAYTAX-122 to 126)"
echo ""

# System 5: Testing Coverage (4 sub-issues)
echo "📦 System 5: Testing Coverage"
node scripts/linear.js create "Testing: Audit Business Logic Testing (/lib/calculations)"
node scripts/linear.js set-parent PAYTAX-127 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-127

node scripts/linear.js create "Testing: Audit Component Testing (atoms, molecules, organisms)"
node scripts/linear.js set-parent PAYTAX-128 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-128

node scripts/linear.js create "Testing: Audit Integration Testing (calculator flows)"
node scripts/linear.js set-parent PAYTAX-129 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-129

node scripts/linear.js create "Testing: Audit E2E Testing (user journeys)"
node scripts/linear.js set-parent PAYTAX-130 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-130

echo "✅ Testing Coverage: 4 issues created (PAYTAX-127 to 130)"
echo ""

# System 6: Responsive Design (4 sub-issues)
echo "📦 System 6: Responsive Design"
node scripts/linear.js create "Responsive: Audit Navigation & Header (Mobile menu, hamburger)"
node scripts/linear.js set-parent PAYTAX-131 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-131

node scripts/linear.js create "Responsive: Audit Calculator UI (Input forms, results on mobile)"
node scripts/linear.js set-parent PAYTAX-132 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-132

node scripts/linear.js create "Responsive: Audit Charts & Visualizations (Responsive Recharts)"
node scripts/linear.js set-parent PAYTAX-133 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-133

node scripts/linear.js create "Responsive: Audit Content Pages (Blog, static pages)"
node scripts/linear.js set-parent PAYTAX-134 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-134

echo "✅ Responsive Design: 4 issues created (PAYTAX-131 to 134)"
echo ""

# System 7: Accessibility (4 sub-issues)
echo "📦 System 7: Accessibility"
node scripts/linear.js create "Accessibility: Audit Keyboard Navigation (Focus management, tab order)"
node scripts/linear.js set-parent PAYTAX-135 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-135

node scripts/linear.js create "Accessibility: Audit ARIA Labels (Icons, buttons, landmarks)"
node scripts/linear.js set-parent PAYTAX-136 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-136

node scripts/linear.js create "Accessibility: Audit Color Contrast (Text, buttons, borders)"
node scripts/linear.js set-parent PAYTAX-137 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-137

node scripts/linear.js create "Accessibility: Audit Screen Reader Experience (Semantic HTML, live regions)"
node scripts/linear.js set-parent PAYTAX-138 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-138

echo "✅ Accessibility: 4 issues created (PAYTAX-135 to 138)"
echo ""

# System 8: Performance (4 sub-issues)
echo "📦 System 8: Performance"
node scripts/linear.js create "Performance: Audit Bundle Size (Code splitting, tree-shaking)"
node scripts/linear.js set-parent PAYTAX-139 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-139

node scripts/linear.js create "Performance: Audit Image Optimization (Next/Image, lazy loading)"
node scripts/linear.js set-parent PAYTAX-140 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-140

node scripts/linear.js create "Performance: Audit Re-render Performance (Zustand selectors, React.memo)"
node scripts/linear.js set-parent PAYTAX-141 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-141

node scripts/linear.js create "Performance: Audit Core Web Vitals (LCP, FID, CLS)"
node scripts/linear.js set-parent PAYTAX-142 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-142

echo "✅ Performance: 4 issues created (PAYTAX-139 to 142)"
echo ""

# System 9: Type Safety (4 sub-issues)
echo "📦 System 9: Type Safety"
node scripts/linear.js create "Type Safety: Audit TypeScript Configuration (strict mode, type checking)"
node scripts/linear.js set-parent PAYTAX-143 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-143

node scripts/linear.js create "Type Safety: Audit Type Coverage (/lib, /hooks, /store)"
node scripts/linear.js set-parent PAYTAX-144 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-144

node scripts/linear.js create "Type Safety: Audit Component Prop Types (interface definitions)"
node scripts/linear.js set-parent PAYTAX-145 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-145

node scripts/linear.js create "Type Safety: Audit ESLint Warnings & Code Quality"
node scripts/linear.js set-parent PAYTAX-146 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-146

echo "✅ Type Safety: 4 issues created (PAYTAX-143 to 146)"
echo ""

# System 10: Tech Stack Maximization (5 sub-issues)
echo "📦 System 10: Tech Stack Maximization"
node scripts/linear.js create "Tech Stack: Audit React 19 Feature Adoption (useOptimistic, useActionState)"
node scripts/linear.js set-parent PAYTAX-147 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-147

node scripts/linear.js create "Tech Stack: Audit Next.js 16 Feature Adoption (after, server actions, parallel routes)"
node scripts/linear.js set-parent PAYTAX-148 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-148

node scripts/linear.js create "Tech Stack: Audit shadcn/ui Pattern Usage (correct composition)"
node scripts/linear.js set-parent PAYTAX-149 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-149

node scripts/linear.js create "Tech Stack: Audit Recharts Configuration & Performance"
node scripts/linear.js set-parent PAYTAX-150 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-150

node scripts/linear.js create "Tech Stack: Audit Framer Motion Animation Patterns"
node scripts/linear.js set-parent PAYTAX-151 $PARENT
node scripts/linear.js assign-to-project $PROJECT PAYTAX-151

echo "✅ Tech Stack Maximization: 5 issues created (PAYTAX-147 to 151)"
echo ""

echo "🎉 COMPLETE! Created 42 sub-issues (PAYTAX-109 to PAYTAX-151)"
echo ""
echo "📋 View in Linear:"
echo "   https://linear.app/payetax/issue/PAYTAX-108"
echo ""
echo "📊 Summary:"
echo "   System 1: Theme System (4 issues)"
echo "   System 2: Design Tokens (5 issues)"
echo "   System 3: Zod Validation (4 issues)"
echo "   System 4: Atomic Design (5 issues)"
echo "   System 5: Testing Coverage (4 issues)"
echo "   System 6: Responsive Design (4 issues)"
echo "   System 7: Accessibility (4 issues)"
echo "   System 8: Performance (4 issues)"
echo "   System 9: Type Safety (4 issues)"
echo "   System 10: Tech Stack (5 issues)"
echo "   TOTAL: 43 issues"
