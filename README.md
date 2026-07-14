# CV Builder

A single-page, ATS-friendly CV generator. Edit `data.json`, open the page, export to PDF.

## Files

- `data.json` — all your CV content and show/hide toggles.
- `index.html/styles.css/script.js` — renders the CV from the JSON and exports to PDF.

## How to run

Because browsers block reading local files via `fetch()`, serve the folder with a
tiny local server (any one of these):

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Export to PDF

**Ctrl + P** and choose **Save as PDF** as the destination. The print stylesheet strips the toolbar and formats it to A4.

## Show / hide anything

Set `"show": false` on any item to hide it — no need to delete it:

- **Whole sections:** `sections.experiences.show`, `sections.projects.show`, `sections.values.show`, `sections.skills.show`, etc.
- **Individual entries:** each experience, project, skill group, value, language, and education item has its own `"show"` flag.
- **Contact fields:** `basics.show` toggles `photo`, `location`, `phone`, `website`, `linkedin`, `github`.

To show your photo: set `basics.photo` to an image path/URL and `basics.show.photo` to `true`.

## Colors

Set in `meta`: `accentColor` (main purple), `accentColorSoft` (light purple), `backgroundColor` (pastel white). Defaults are a purple-on-pastel-white theme.

## Layout

- **Two columns:** a narrow purple sidebar (Skills, Languages, Personal Values) and a wide main column (Profile, Experience, Projects, Education), under a full-width header.
- **Locked to A4:** the sheet is a fixed 210×297 mm page on screen and in print, so what you see matches the PDF exactly. Content flows onto extra A4 pages if it doesn't fit one.

## Why it's "good" for humans and robots (ATS)

- Semantic HTML (`<header>`, `<section>`, `<h1>/<h2>`, real `<ul>` lists) so parsers read content in DOM order, with no text trapped in images.
- Contact details are real, selectable text and links (mailto/tel).
- Standard section headings (Experience, Skills, Education…) that ATS expect.
- Selectable text in the PDF (via print, not a screenshot), clean date ranges, and concise, action-oriented bullet points.
