# Workspace Rules

- **Do Not Push**: Do not run `git push` automatically. Always leave git push actions for the user unless explicitly instructed.
- **Mobile Application Only**: All updates, code changes, and task execution must focus strictly on the mobile application frontend (`MobileApp/`). Do NOT touch backend code (`backend/`) or web application code (`App/`).
- **Preserve Business Logic**: Never alter backend logic, business logic, API integration, or state handling when updating frontend UI.
- **UI Design System**:
  - **Professional & Industry-Standard**: Clean, modern, enterprise-grade aesthetic.
  - **No Nested Cards**: Never put cards inside cards. Use a single card container per element with inner content structured using sub-layouts or soft dividers.
  - **Card Styling**: Square corners (`borderRadius: 0`), solid white background (`#FFFFFF`), and minimal/subtle shadow (avoid heavy drop shadows).
  - **Active Color**: Primary/Active color must strictly be **Blue**.
  - **Typography**: Maintain consistent font style, weights, and sizing hierarchy across all mobile application screens.
  - **Section Separators**: Main section dividers must strictly use `height: 1`, `backgroundColor: '#94A3B8'` (Slate 400), and compact `marginVertical: 6dp` for crisp visual structure without card containers.


# Mobile Application UI Design Rules — Clean & Professional Standard

You are designing and improving a production-grade mobile application.

These rules are **mandatory and must be followed every time you create, modify, or improve any UI**.

## 1. Core Design Principle

The UI must always feel:

* Clean
* Professional
* Modern
* Minimal
* Structured
* Premium
* Easy to understand
* Easy to navigate
* Visually calm

**Avoid visual clutter at all costs.**

The user should immediately understand:

1. Where they are
2. What they can do
3. What action is most important
4. What information matters most

---

## 2. NO MESSY UI

Never create:

* Excessive cards
* Excessive borders
* Too many buttons
* Too many colors
* Excessive icons
* Unnecessary badges
* Random spacing
* Overlapping elements
* Dense text blocks
* Repeated information
* Decorative elements without purpose

Every UI element must have a clear purpose.

If an element does not improve usability, **remove it**.

---

## 3. Visual Hierarchy

Every screen must have a clear hierarchy:

### Level 1 — Primary

Most important information/action.

### Level 2 — Secondary

Supporting information.

### Level 3 — Tertiary

Additional metadata or optional actions.

Do not make every element visually equally important.

Use:

* Font size
* Font weight
* Spacing
* Position
* Contrast

to establish hierarchy.

---

## 4. Typography

Use a professional Android-friendly font system.

Preferred:

**Inter / Roboto**

Typography must be consistent throughout the application.

Recommended hierarchy:

* Screen title: Bold / Semibold
* Section title: Semibold
* Primary content: Medium / Regular
* Secondary content: Regular
* Metadata: Regular / Medium

Avoid:

* Excessive bold text
* Too many font sizes
* ALL CAPS unnecessarily
* Decorative fonts
* Inconsistent typography

---

## 5. Spacing

Use a consistent spacing system.

Prefer an **8dp spacing grid**.

Examples:

* 4dp — micro spacing
* 8dp — small spacing
* 12dp — compact spacing
* 16dp — standard spacing
* 24dp — section spacing
* 32dp — major separation

Never randomly choose margins or padding.

---

## 6. Colors

Use a restrained color palette.

Maximum:

* 1 primary brand color
* 1 secondary/accent color
* Neutral background
* Neutral text colors
* Semantic colors for success/warning/error

Avoid:

* Rainbow interfaces
* Excessive gradients
* Neon colors
* Unnecessary color variations
* Low-contrast text

Color should communicate meaning, not decoration.

---

## 7. Cards

Cards must be used only when they improve information grouping.

Do NOT put everything inside cards.

Avoid:

* Nested cards
* Cards inside cards
* Excessive borders
* Heavy shadows
* Large rounded containers everywhere

Cards should feel lightweight and intentional.

---

## 8. Buttons

Every screen should have a clear primary action.

Use:

**Primary CTA → strongest visual emphasis**

**Secondary CTA → lower emphasis**

**Tertiary action → text/icon action**

Never give multiple actions equal visual importance when one is clearly primary.

Button text must be:

* Short
* Action-oriented
* Clear

Example:

Good:
`Apply Now`

Bad:
`Click Here To Apply For This Job`

---

## 9. Icons

Use one consistent icon library throughout the application.

Icons must:

* Have consistent visual weight
* Have consistent size
* Be aligned properly
* Have sufficient touch area

Never use icons merely for decoration.

---

## 10. Touch Targets

All interactive elements must be comfortable for mobile use.

Target approximately:

**44–48dp minimum touch area**

Never create tiny clickable icons or buttons.

---

## 11. Alignment

Alignment must be extremely consistent.

Prefer:

* Common left edges
* Consistent horizontal padding
* Consistent vertical rhythm
* Proper baseline alignment

Nothing should appear accidentally misaligned.

Before finalizing a screen, visually inspect:

* Text alignment
* Icon alignment
* Button alignment
* Card alignment
* Image alignment
* Section spacing

---

## 12. Screen Density

Do not overload a screen.

If too much information exists:

**Prioritize → Group → Collapse → Navigate**

Do NOT simply squeeze everything onto one screen.

A clean screen is better than a screen containing every available option.

---

## 13. Navigation

Navigation must be predictable.

Users should always understand:

* Current location
* Previous location
* Available destinations
* Primary next action

Do not create unnecessary navigation layers.

---

## 14. Loading States

Every API-dependent screen must have a proper loading state.

Never show:

* Blank white screens
* Sudden layout jumps
* Unexplained spinners

Prefer:

* Skeleton loaders
* Proper placeholders
* Progressive loading

---

## 15. Empty States

Empty states must be intentional.

Never leave an empty screen blank.

Example:

**No applications yet**

`You haven't applied for any jobs yet.`

[Browse Jobs]

Keep empty states concise.

---

## 16. Error States

Errors must be understandable.

Never expose:

* Raw API errors
* Stack traces
* Database errors
* Technical exceptions

Instead show a user-friendly message and recovery action.

Example:

`Something went wrong.`

`Please try again.`

[Retry]

---

## 17. Forms

Forms must be simple and focused.

Rules:

* Clear labels
* Proper keyboard type
* Inline validation
* Helpful error messages
* Correct input spacing
* Minimal fields
* Clear submit action

Never make users guess what information is required.

---

## 18. Images

Images must:

* Maintain correct aspect ratio
* Load progressively
* Have appropriate placeholders
* Handle failed loading gracefully
* Avoid distortion

Profile images should always have consistent sizing and cropping.

---

## 19. Animations

Animations should improve usability.

Use:

* Short transitions
* Subtle feedback
* Smooth navigation
* Micro-interactions

Avoid:

* Excessive animations
* Bouncing everything
* Slow transitions
* Decorative animations

The application should feel **fast**, not animated.

---

## 20. Shadows & Elevation

Use subtle elevation.

Avoid heavy shadows.

The interface should feel:

**structured rather than floating.**

---

## 21. Responsive Design

The UI must work correctly across:

* Small Android phones
* Large Android phones
* Different aspect ratios
* Different screen densities
* System font scaling

Never hardcode dimensions that break on different devices.

---

## 22. Accessibility

Maintain:

* Sufficient color contrast
* Readable font sizes
* Large touch targets
* Screen-reader-friendly labels
* Logical focus order

Accessibility must never be sacrificed for appearance.

---

# MOST IMPORTANT RULE

### DO NOT REDESIGN EXISTING UI WITHOUT EXPLICIT INSTRUCTION.

When improving an existing screen:

1. Preserve the existing design language.
2. Preserve existing layout.
3. Preserve existing functionality.
4. Preserve existing navigation.
5. Preserve existing colors unless explicitly requested.
6. Preserve existing component behavior.
7. Improve only what is necessary.
8. Do not introduce unnecessary UI elements.

**UI consistency is more important than adding visual complexity.**

---

# Final UI Quality Check

Before considering any UI task complete, verify:

### Visual

* Clean
* Minimal
* Proper spacing
* Proper alignment
* Consistent typography
* Consistent colors
* No unnecessary elements
* No visual clutter

### UX

* Clear hierarchy
* Clear CTA
* Predictable navigation
* Easy interaction
* Proper loading state
* Proper empty state
* Proper error state

### Technical

* Responsive
* Accessible
* No layout overflow
* No clipped text
* No broken images
* No unnecessary re-renders
* Production-safe implementation

### Final Principle

> **If the UI can communicate the same information with fewer elements, use fewer elements.**

The goal is not to make the interface look complicated.

The goal is to make it look **effortless, intentional, and professional.**
