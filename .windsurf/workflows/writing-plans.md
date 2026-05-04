---
name: writing-plans
description: Use when you have an approved spec, design document, or set of requirements for a multi-step task, before writing any implementation code. Transforms specs into bite-sized executable tasks with complete code and verification steps.
agent_created: true
---

# Writing Plans

## Overview

Take an approved spec or design and produce a comprehensive implementation plan. Each task in the plan is 2-5 minutes of work with complete code, exact file paths, verification commands, and zero ambiguity.

**Core principle:** An enthusiastic junior engineer with no context, questionable taste, and an aversion to testing must be able to follow every step without guessing.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

## Scope Check

**Before defining any task**, check whether the spec covers multiple independent subsystems:

- **Single focused feature** → proceed to file structure
- **Multiple independent subsystems** (e.g. "build a platform with chat, file storage, billing") → STOP. Tell the user this needs decomposition into separate plans. Implement one plan at a time as distinct work cycles.

Each plan must produce working, testable software on its own.

## File Structure

Before defining tasks, map out which files will be created or modified:

- Design units with clear boundaries and well-defined interfaces. Each file should have one clear responsibility.
- In existing codebases, follow established patterns. If a file you're modifying has grown unwieldy, including a split in the plan is reasonable.
- Files that change together should live together. Split by responsibility, not by technical layer.

Output a concise file structure table:

```markdown
| File | Responsibility | Action |
|------|---------------|--------|
| `src/auth/middleware.ts` | JWT verification middleware | Create |
| `src/auth/login.ts` | Login endpoint handler | Modify |
| `tests/auth/login.test.ts` | Login behavior tests | Create |
```

## The Iron Law

```
NO TASK WITHOUT COMPLETE CODE, FILE PATH, AND VERIFICATION COMMAND
```

Every task must be fully specified. No placeholders. No TODOs. No "fill in later".

## Bite-Sized Task Granularity

**Each task is one action (2-5 minutes).** If a task would take longer, split it.

Good task sizes:
- Write the failing test → 2 min
- Run it and confirm it fails → 1 min
- Implement minimal code → 3 min
- Run tests and confirm pass → 1 min
- Commit → 1 min

## Task Structure

```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
```

### Plan Document Format

Save the plan to a markdown file. Default location: `docs/plans/YYYY-MM-DD-<feature-name>.md` (user's preference overrides).

```markdown
# [Feature Name] Implementation Plan

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## No Placeholders

Every step must contain the actual content an engineer needs. These are **plan failures** — never write them:

- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code — the engineer may be reading tasks out of order)
- Steps that describe what to do without showing how (code blocks required for code steps)
- References to types, functions, or methods not defined in any task

## Self-Review

After writing the complete plan, review it against the spec:

**1. Spec coverage:** Skim each section/requirement in the spec. Can you point to a task that implements it? List any gaps.

**2. Placeholder scan:** Search for any of the patterns from "No Placeholders" above. Fix them immediately.

**3. Type consistency:** Do the types, method signatures, and property names match across all tasks? A function called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug.

If you find issues, fix them inline. No need to re-review — just fix and move on.

## Execution Handoff

After saving the plan, offer execution choice:

```
Plan complete and saved to docs/plans/<filename>.md.

Two execution options:

1. Subagent-Driven (recommended) — I dispatch a fresh subagent per task using the Agent tool, with review between tasks. Fast iteration, isolated context.

2. Inline Execution — Execute tasks directly in this session, one at a time, with checkpoints for review.

Which approach?
```

### Subagent-Driven Execution

Use the `Agent` tool to dispatch each task:

```markdown
1. Create a TaskCreate for each task in the plan
2. For each task, invoke the Agent tool with subagent_type="general-purpose":
   - Provide the complete task text (code, file paths, verification commands)
   - Include necessary project context (file structure, conventions)
   - Do NOT inherit your session's history — construct exactly what the subagent needs
3. After each task completes:
   - Verify the output by checking the result and running verification commands
   - Mark the task as completed in TaskUpdate
   - Proceed to the next task
```

**IMPORTANT:** The subagent should follow TDD (use the `tdd` skill). Do NOT dispatch multiple implementation subagents in parallel (they would conflict when editing the same files).

### Inline Execution

Execute tasks directly:

1. Create a TaskCreate for each task in the plan
2. Work through them one by one, marking each in_progress/complete
3. After all tasks complete, run the full test suite
4. Present completion result

## Red Flags

**Never:**
- Write "TBD", "TODO", or any placeholder content
- Reference types/classes not defined in any task
- Skip the self-review step
- Combine multiple features into one plan without decomposition
- Create tasks that take longer than 5 minutes
- Skip verification commands in task steps

**Always:**
- Complete code in every step
- Exact file paths with line numbers for modifications
- Exact commands with expected output
- Self-review against the spec
- Offer execution choice after saving

## Quick Reference

| Element | Rule |
|---------|------|
| Task time | 2-5 minutes each |
| Code | Complete, not "similar to" |
| Paths | Exact, with line numbers for modifications |
| Commands | Exact, with expected output |
| Placeholders | Zero — delete on sight |
| Scope | One feature per plan |
| Self-review | Spec coverage + placeholder scan + type consistency |
| Execution | Offer subagent-driven vs inline |

## Integration

**Called by:**
- **brainstorming** — After design is approved, this skill generates the implementation plan
- **project-workflow** — After PRD and issues are defined, this skill creates the granular implementation plan

**Pairs with:**
- **tdd** — Subagents and inline execution use TDD for each task
- **Agent tool (subagent_type="general-purpose")** — For subagent-driven execution mode
