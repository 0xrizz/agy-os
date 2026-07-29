# AGENTS.md Quality Criteria Rubric

This reference defines the 6 criteria used to evaluate `AGENTS.md`, `RULES.md`, and `.agents/rules/*.md` files within the Antigravity agent harness.

---

## 1. Workspace Boundaries & Security Controls (20 points)

**20 points**: Explicit workspace boundaries and access controls documented.
- Clear separation between Target Repos (e.g. Read-Only) and Harness Repos (Read & Write).
- Strict guidelines against direct writes to forbidden directories.
- Staging patch requirement for modifications (`.patch` or `.diff` files).

**15 points**: Boundaries documented but missing patch staging details.

**10 points**: Vague directory permissions without explicit Read-Only designations.

**5 points**: Ambiguous file boundaries.

**0 points**: No access control or boundary rules documented.

---

## 2. Path Formatting & Shell Environment Invariants (20 points)

**20 points**: Full path and shell execution environment compliance.
- Strict requirement for forward-slash (`/`) path format across all platforms.
- Explicit terminal execution environment defined (e.g., Git Bash / bash execution).
- Clear prohibition of backslashes (`\`) and unapproved shell launchers (CMD/PowerShell).

**15 points**: Forward-slash rule present but shell launcher unspecified.

**10 points**: Generic path guidelines with occasional improper examples.

**5 points**: Unclear or conflicting shell rules.

**0 points**: No pathing or shell standards defined.

---

## 3. Skill & Registry Governance (20 points)

**20 points**: Complete compliance with `agentskills.io` standard & registry purity.
- `SKILL.md` location, naming (`[a-z0-9-]`), and frontmatter structure enforced.
- Progressive disclosure capped (<500 lines for primary `SKILL.md`).
- Flat & lean layout for `.agents/workflows/` with zero nested markdown subdirectories.

**15 points**: Frontmatter compliant but lacks workflow registry purity rules.

**10 points**: Basic skill layout present, loose line limits.

**5 points**: Non-standard directory naming or missing frontmatter fields.

**0 points**: No skill or workflow governance rules.

---

## 4. Architecture & Workflow Clarity (15 points)

**15 points**: Comprehensive overview of codebase structure and agent workflows.
- Primary entry points, directory map, and project modules clearly detailed.
- Dev, test, build, lint, and verification commands specified.
- Clear step-by-step guidance for key agent execution paths.

**10 points**: Basic directory map, minor missing commands.

**5 points**: Sparse directory overview, missing build/test steps.

**0 points**: No architecture or command documentation.

---

## 5. Non-Obvious Gotchas & Architectural Invariants (15 points)

**15 points**: Critical gotchas, edge cases, and harness quirks documented.
- Known environment issues and workarounds captured.
- Rationale provided for non-standard architectural patterns ("Why we do it this way").
- Clear guardrails against anti-patterns (e.g., swallowed errors, dummy fallbacks).

**10 points**: Some gotchas documented, missing rationale.

**5 points**: Minimal edge case documentation.

**0 points**: No gotchas or invariants captured.

---

## 6. Actionability & Conciseness (10 points)

**10 points**: Highly actionable, concise, and current.
- Copy-paste ready shell snippets and command syntax.
- Dense, structured markdown without narrative wordiness.
- All references reflect actual codebase state (zero stale paths or deprecated commands).

**7 points**: Mostly actionable, minor wordiness.

**4 points**: Vague text descriptions instead of executable commands.

**0 points**: Outdated, non-actionable, or heavily padded text.
