---
name: commit-message
description: Recommend a semantic Conventional Commit message for CyberSim with Why, What, and Impact sections from staged Git changes, a diff summary, or a user description. Use when asked to suggest or write a commit message.
---

# Generate Commit Message

Generate a semantic Git commit message for CyberSim. Recommend the message; do not stage changes, create a commit, or push unless the user separately requests those actions.

## Output behavior

Return exactly one copy-pasteable commit message inside a fenced `text` block.

Do not provide explanations, alternatives, introductory text, or commentary unless the user explicitly asks for them. If the changes are unknown, ask only for the missing change summary instead of fabricating a message.

## Commit rules

- Use Conventional Commits for the first line.
- Use an imperative, concise summary without a final period.
- Keep the message high-level and semantic: describe intent, behavior, architectural impact, or user-facing effects.
- Do not mention project file paths in Why, What, or Impact.
- Prefer English unless the user explicitly requests another language. Keep the section labels Why, What, and Impact.
- Never add AI attribution or a `Co-Authored-By` line.
- Do not claim tests, lint, typechecking, build, or runtime checks passed without evidence covering the changes being described.

Choose the type that expresses the main intent of the change:

| Type | Use |
|---|---|
| `feat` | Add or extend functionality |
| `fix` | Correct defective behavior |
| `refactor` | Change structure without changing expected behavior |
| `test` | Add or improve tests |
| `docs` | Modify documentation only |
| `chore` | Perform maintenance work |
| `build` | Change the build system, packaging, or dependencies |

A move to separate workspaces is normally `refactor` when behavior stays the same. A correction to executable build artifacts can be `fix` or `build` according to the dominant intent. Do not label file moves as a feature unless they also add functionality.

## CyberSim context and area scopes

CyberSim has a React/Vite frontend, an Express/TypeScript backend, and Prisma/PostgreSQL persistence. Use only the scopes `front`, `back`, and `db`; never use feature or module names as scopes.

| Scope | Area |
|---|---|
| `front` | Frontend application, UI, 3D simulation, ECS, scenario content, and frontend tests, tooling, or dependencies |
| `back` | Backend API, business logic, service integrations, persistence repositories, and backend tests, tooling, or dependencies |
| `db` | Database schema, migrations, seeds, and database-specific connection or Prisma configuration |

Classify the actual change by its area, not merely its directory. Database schema, migrations, seeds, and database-specific configuration use `db` even when stored inside the backend workspace. Changes to API behavior or application repositories use `back`; a build or packaging change in the backend also uses `back`, even if it packages a generated database client.

Use one scope when all selected changes belong to the same area, even if several functional modules change. Omit the scope when the selected changes span more than one of `front`, `back`, and `db`, or affect repository-wide architecture and tooling. Documentation-only changes remain unscoped. Still return one message for the selected changes; do not split it into separate messages per area.

## Scope and user-story rules

Choose the first-line format according to the change:

| Change scope | First-line format |
|---|---|
| One area within a user story | `<type>(<scope>): HUxxx <summary>` |
| Cross-cutting change within a user story | `<type>: HUxxx <summary>` |
| Documentation only | `docs: <summary>` |
| No user story provided | `<type>(<scope>): <summary>` or `<type>: <summary>` |

Use the HU identifier to identify the associated feature, for example `HU101`. Include it only when supplied by the user or explicitly established for the selected changes in the conversation. Do not infer an HU from branch names, prior commits, or project history alone.

Never include task numbers, task identifiers, or task suffixes in the commit message. If the input includes a task reference associated with an HU, retain only the HU identifier. Including an HU identifies the feature; it does not by itself assert that the entire user story is complete.

Only include a scope when the change is clearly limited to one area: front, back, or db. Documentation-only changes use the unscoped `docs: <summary>` format shown above.

## Message format

Always use this structure, applying any supported HU identifier to the first line as specified above:

```text
<type-or-scoped-type>: <short imperative summary>

Why:
<one concise paragraph explaining the motivation>

What:
- <high-level semantic change>
- <high-level semantic change>

Impact:
<one concise paragraph explaining the result, reduced risk, or future benefit>
```

Adjust the number of What bullets to the actual changes. Do not invent changes merely to fill the template.

## Execution process

1. Determine the changes from the available information in this order:
   - Run `git status --short` to distinguish staged, unstaged, and untracked changes.
   - When staged changes exist, inspect `git diff --cached --stat` and `git diff --cached`. The staged diff defines the proposed commit; do not mix in unstaged edits, untracked files, or earlier conversational work unless the user explicitly includes them.
   - If no staged changes exist, use the diff or change summary supplied by the user, then their natural-language description. If the user requests a message for current unstaged changes, inspect `git diff` and the relevant untracked content without staging anything.
   - For large diffs, inspect summaries and representative code while accounting for all staged areas. Use rename detection to distinguish reorganization from behavior changes.
2. Identify the dominant Conventional Commit type, whether the changes affect one area or multiple areas, and any explicitly supplied HU associated with the selected changes.
3. Write the first line using the scope and user-story rules.
4. Write Why as the reason for the change: explain the problem, limitation, or need without listing modified files or repeating the first line. Infer motivation only when supported by the actual diff or description.
5. Write What as semantic changes: describe behavior and responsibilities, avoid low-level implementation trivia, and do not include file paths.
6. Write Impact as the supported result: user-facing benefit, maintainer benefit, risk reduction, architectural improvement, or enablement of future work. Distinguish an intended benefit from a verified outcome; do not invent performance, security, or compatibility guarantees.
7. Verify before responding:
   - The first line follows Conventional Commits and uses an imperative summary without a final period.
   - The scope is exactly front, back, or db and matches the affected area, or is omitted for cross-cutting changes.
   - Only supported HU identifiers are included, without task numbers or suffixes.
   - The body has Why, What, and Impact, with the actual number of What bullets needed.
   - The message covers the selected changes without including unrelated work.
   - No unsupported changes, motivation, impact, or validation claims were invented.
   - No project file paths, AI attribution, or co-author line appear in the message.
   - The response contains exactly one fenced `text` block, except when the user explicitly asks for additional explanation.

## Missing information

Do not invent an HU, scope, motivation, or impact. Omit the HU or scope when it cannot be inferred reliably. If there is insufficient information to generate an accurate message, ask only for the missing change summary. Do not require an HU when the message can be generated without one.
