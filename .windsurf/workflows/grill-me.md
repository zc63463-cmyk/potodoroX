---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree one by one. Use when user wants to stress-test a plan, get grilled on their design, mentions "grill me", or wants to validate a decision before implementation.
agent_created: true
---

# Grill Me

Interview the user relentlessly about every aspect of their plan until shared understanding is reached. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide a recommended answer.

## How It Works

1. **Ask questions one at a time.** Wait for feedback on each question before continuing. Do not dump a list of questions.

2. **If a question can be answered by exploring the codebase, explore the codebase instead** of asking the user. Use the Agent tool with Explore subagent or Grep/Glob to investigate.

3. **Provide a recommended answer** for each question. Do not just ask open-ended questions — offer a concrete suggestion and let the user confirm or override.

4. **Walk the dependency tree.** Resolve decisions in dependency order. If decision B depends on decision A, resolve A first. Do not skip ahead.

5. **Be relentless but not annoying.** Push for specificity when the user is vague, but accept "I'm not sure yet, let's come back to this" as a valid answer. Mark it and return later.

6. **Summarize progress.** After every 3-5 resolved decisions, briefly summarize what has been agreed upon so far.

## When to Stop

Stop grilling when:
- All branches of the decision tree have been resolved
- The user explicitly says they have had enough
- Enough decisions are resolved to proceed with implementation (remaining decisions can be made inline)

## Output

At the end of the session, provide a concise summary of all decisions made, formatted as a checklist that can be used as a reference during implementation.
