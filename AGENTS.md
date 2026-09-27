# AGENTS.md — Academic Board Exam Portal

## Project Overview
Static single-page web app (HTML/CSS/JS) for Bangladesh board exam study/exam practice.
- **Language**: Bengali (bn)
- **No build step, no package.json, no dependencies**
- Runs directly in browser: open `index.html`

## File Structure
```
index.html   # Main HTML (136 lines)
style.css    # All styles (389 lines)
script.js    # Application logic (currently empty)
```

## Running the Project
```bash
# No install needed. Open directly:
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
# Or serve locally (optional):
npx serve .             # or python -m http.server
```

## Key Features (from HTML)
- Semester study tracker with calendar grid
- Daily stats dashboard (questions attempted, correct/wrong)
- 60-day study history board
- Academic level selector: Honours Management / HSC Humanities / HSC Science / HSC Business
- Subject cards per level (Honours: 6 subjects; HSC: dynamic)
- Two modes: Study (knowledge Q&A) and Exam (MCQ)
- Question count input (1–10000)
- Monthly exam button (100 questions)

## Development Notes
- **CSS uses custom properties** (`:root` vars) for theming
- **Responsive**: dashboard stacks on ≤720px
- **Data persistence**: Likely uses `localStorage` (check `script.js` when populated)
- **Language**: All UI text is Bengali; keep this in mind for any string changes
- **Warning banner** at top notes content is AI-generated

## What Agents Should Know
- No linting, formatting, typechecking, or test commands exist
- No CI/CD, no framework, no bundler
- Edit files directly; refresh browser to test
- `script.js` is empty — any logic must be added from scratch
- If adding JS, consider ES modules (`<script type="module">`) for organization