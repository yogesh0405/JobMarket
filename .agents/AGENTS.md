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


