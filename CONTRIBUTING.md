# Contributing to CV Builder

Thanks for your interest! 🎉

## Workflow

> [!IMPORTANT]
> Please **open a pull request** — don't push directly to `main`.

1. Fork the repo and create a branch: `git checkout -b feat/my-feature`
2. Make your changes and check that the CV still renders and prints correctly:
   ```sh
   python3 -m http.server 8000
   # open http://localhost:8000, then Ctrl + P → Save as PDF
   ```
3. Commit following the convention below.
4. Open a pull request describing **what** you changed and **why**.

> [!NOTE]
> Never commit your personal `data.json`: it is git-ignored on purpose. Make changes to the template in `data.example.json` instead.

## Commit convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short description>
```

| Type       | Use for                                   |
| ---------- | ----------------------------------------- |
| `feat`     | a new feature                             |
| `fix`      | a bug fix                                 |
| `docs`     | documentation only                        |
| `style`    | formatting, no code change                |
| `refactor` | code change that is neither fix nor feat  |
| `perf`     | performance improvement                   |
| `test`     | adding or fixing tests                    |
| `chore`    | tooling, dependencies, config             |

Examples:

```
feat(skills): add a note below the skill groups
fix: hide the footer when "final" is empty
docs(readme): update screenshots
```

## Reporting a bug

Open an issue with steps to reproduce, what you expected and what happened (a screenshot of the rendered CV helps).
