---
name: nemesh-feature-workflow
description: Orchestrate Nemesh product work across the product manager, product designer, senior fullstack developer, and later QA. Use manually to start or continue a feature, change, audit, or workflow smoke test while preserving scope, current evidence, Product Owner authority, and role gates.
argument-hint: "[request, feature slug, or continue]"
disable-model-invocation: true
---

# Nemesh Feature Workflow

Orchestrate `$ARGUMENTS` from the main conversation. You own routing and state; specialist agents own only their defined roles. The user is the Product Owner.

## Establish the run before delegating

Determine and state:

1. **Intent** — `NEW FEATURE`, `CHANGE EXISTING`, `AUDIT EXISTING`, `SMOKE TEST`, or `CONTINUE`.
2. **Authority** — `ANALYSIS ONLY` or `IMPLEMENTATION ALLOWED`. An audit, review, investigation, or smoke test does not authorize implementation.
3. **Route** — `QUICK`, `STANDARD`, or `AUDIT/TEST`, using [routing.md](references/routing.md).
4. **Feature slug** and the active handoff directory, when persistent artifacts are needed.

Ask the Product Owner only when a missing answer would materially change these values. Never infer implementation authority from the existence of a gap or recommendation.

For `CONTINUE`, first locate the active `workflow.md` and recover its original intent, authority, route, scope, decisions, and open gate. If more than one workflow could be active, ask which one. Do not reclassify or broaden the run merely because the Product Owner said “continue”; change those fields only when the new message explicitly changes them.

### Retrospective review vs live smoke test

`SMOKE TEST` covers two different exercises. State which one is running and do not conflate them:

- **Retrospective conformance review** — compares an earlier workflow run's decisions and routing against the current router and role contracts. It checks documented conformance only. It does not exercise live delegation, and must never be reported as validating live orchestration.
- **Live workflow smoke test** — actually invokes the skill's delegations and drives real returned statuses through the router to a named stop gate. Only this exercises routing and role boundaries in operation.

A retrospective review may recommend a live smoke test; it cannot substitute for one.

## Core invariants

- Preserve the original request and approved decisions. Keep newly discovered improvements in a separate follow-up list; do not absorb them into scope.
- Treat current rendered behavior and direct Product Owner evidence as authoritative current-state evidence. Do not let an older screenshot, handoff, or agent assumption override newer evidence.
- Use the smallest route that safely handles the request. Do not run roles or create artifacts merely to complete a ceremonial sequence.
- Delegate each question to the role whose authority covers it. Do not ask one role to make another role's decision.
- Pass bounded evidence to agents. Never tell an agent only to “continue”; state the active intent, authority, scope, accepted decisions, new evidence, expected output, and stop condition.
- Inspect every returned artifact and status before routing onward. Check it against the current workflow state and the artifact it claims to consume.
- Resume the same agent for a correction to its own work when possible. Start a fresh invocation only for a new mode, independent review, or lost agent context.
- Continue automatically across ordinary gates inside approved scope. Pause only for a Product Owner decision, missing material evidence, new authority, destructive or meaning-changing data work, a new dependency, a difficult-to-reverse choice, or an external blocker.
- Do not implement during feasibility, design, audit, or smoke-test runs.
- Do not claim QA completion until a QA role exists and returns a passing result.

## Workflow state

For `STANDARD`, multi-turn `AUDIT/TEST`, or any run likely to survive context compaction, maintain:

`.claude/handoffs/<feature-slug>/workflow.md`

Keep it compact and update it only at meaningful transitions. Use the state contract in [delegation-and-state.md](references/delegation-and-state.md). This file records decisions and routing; it does not duplicate role handoffs.

`workflow.md` is state, not a report. Keep it to roughly 25–40 lines: one concise progress entry per role/mode, the accepted decisions, the open gate, and the next action. Do not paste routing tables, detailed findings, per-finding analysis, or a chronological narrative into it. Detailed audit or smoke-test results belong in the conversational report to the Product Owner, and in a separate audit artifact only when the Product Owner explicitly asked for one.

## Invoke and route roles

Use the existing project agents by exact name:

- `nemesh-product-manager`
- `nemesh-product-designer`
- `nemesh-senior-fullstack-developer`

Read [routing.md](references/routing.md) before the first delegation in a run and whenever a returned status changes the route. Read [delegation-and-state.md](references/delegation-and-state.md) before composing a delegation or updating `workflow.md`.

Do not copy role instructions into the delegation. Supply only task-specific context, evidence, authority, required mode, output path, and stop condition.

## Communicate with the Product Owner

Lead with the current outcome, not agent mechanics. At a real decision gate, present only:

- the decision and why it matters;
- two or three materially distinct choices;
- the concrete consequence of each;
- the justified recommendation, if one exists.

Do not ask the Product Owner to approve facts already established, implementation details within developer authority, or options that disappeared after feasibility.

When the run stops, report the workflow status, what is complete, what remains, and the single next action. For `AUDIT EXISTING` and `SMOKE TEST`, explicitly distinguish observed gaps from authorized follow-up work.

Before listing any follow-up candidate or recommended safeguard, check it against the current skill, routing, and agent rules. If the safeguard already exists, report it as already covered rather than proposing it as a change.
