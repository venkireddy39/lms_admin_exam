---
trigger: always_on
---

# UI Design Rules – LMS Project

## 1. Code Size Control
- Do NOT generate full large applications.
- Generate only required components or modules.
- Avoid unnecessary boilerplate.
- Keep responses minimal and focused.

## 2. Styling Rules
- Use Bootstrap 5 only.
- Do NOT mix Tailwind or other CSS frameworks.
- Use Bootstrap grid system properly (`container`, `row`, `col-*`).
- Use Bootstrap form controls and validation classes.
- Maintain consistent spacing using Bootstrap utility classes (`mt-3`, `mb-2`, `p-3`, etc.).

## 3. UI Structure
- Clean layout.
- Proper alignment.
- Responsive design.
- Card-based layout for modules (Course, Batch, Attendance, Fees).
- Tables must use Bootstrap table classes.

## 4. Backend Separation
- Course, Batch, Attendance, and Classes may come from different backends.
- Do NOT assume a single backend.
- APIs must be modular and configurable.
- Use environment-based API URLs.

## 5. Code Quality
- No duplicate logic.
- Reusable components.
- Proper naming conventions.
- Clear separation: Controller → Service → Repository (Spring Boot).
- Clean folder structure.

## 6. Restrictions
- Do NOT overdesign.
- Do NOT add animations unless requested.
- Do NOT use inline CSS unless necessary.
- Keep UI professional and simple.

## 7. Output Format
- Give only required code.
- Avoid long explanations.
- Provide structured and readable code blocks.## 8. Remove Unused Code & Tables

### Backend (Spring Boot)
- Delete unused entities.
- Delete unused DTOs.
- Delete unused repositories.
- Delete unused services.
- Remove unused API endpoints.
- Remove unused imports.
- Remove commented dead code.
- Drop unused database tables.
- Remove unused columns from tables.
- No duplicate mappings.

### Frontend (React + Bootstrap)
- Delete unused components.
- Delete unused routes.
- Remove unused state variables.
- Remove unused API calls.
- Remove unused CSS.
- Remove console.logs before final code.
- No duplicate forms or tables.

### Database
- No orphan tables.
- No unused foreign keys.
- No duplicate fee / batch tables.
- Keep schema clean and normalized.

### Rule
If something is not used in the current flow → remove it.
Keep the project lean.