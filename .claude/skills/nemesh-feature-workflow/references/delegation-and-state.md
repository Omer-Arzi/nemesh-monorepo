# Delegation and workflow state

## Delegation contract

Every specialist delegation must contain the following task-specific fields:

1. **Role mode** — the exact mode defined by that agent.
2. **Workflow intent** — `NEW FEATURE`, `CHANGE EXISTING`, `AUDIT EXISTING`, `SMOKE TEST`, or `CONTINUE`. For `SMOKE TEST`, state whether it is a retrospective conformance review (compares an earlier run against the current router) or a live smoke test (exercises real delegations and routing). A retrospective review never validates live orchestration.
3. **Execution authority** — `ANALYSIS ONLY` or `IMPLEMENTATION ALLOWED`.
4. **Original request** — concise and faithful to the Product Owner's wording.
5. **In scope / out of scope** — include only boundaries relevant to this role.
6. **Accepted decisions and assumptions** — cite the source artifact or Product Owner message.
7. **Current evidence** — distinguish direct Product Owner evidence, rendered observations, and older artifacts. State conflicts explicitly and identify which evidence is authoritative.
8. **Inputs** — exact handoff paths or evidence the role may consume.
9. **Requested output** — expected status family and artifact path.
10. **Stop condition** — what must cause the agent to pause rather than continue.

Add explicit prohibitions only when they address a realistic scope risk in the current task. Avoid generic repetitions of the agent's own file.

When resuming an agent, also state:

- what changed since its last run;
- whether this is a factual correction, a Product Owner decision, feasibility feedback, or a new task;
- which prior conclusions must be preserved unless the new information genuinely changes them.

## `workflow.md` contract

Use this compact structure:

```markdown
# <Feature name> workflow

- Status: ACTIVE | AWAITING PRODUCT OWNER | BLOCKED | AUDIT COMPLETE | SMOKE TEST COMPLETE | READY FOR QA | COMPLETE
- Intent: NEW FEATURE | CHANGE EXISTING | AUDIT EXISTING | SMOKE TEST
- Authority: ANALYSIS ONLY | IMPLEMENTATION ALLOWED
- Route: QUICK | STANDARD | AUDIT/TEST
- Feature slug: <slug>

## Original request
<One faithful paragraph.>

## Active scope
- In: ...
- Out: ...

## Current evidence
- <Evidence, source, and whether it supersedes older evidence.>

## Decisions
- <Decision, owner, and source.>

## Progress
- <Role/mode>: <returned status> — <artifact path or concise result>

## Follow-up candidates
- <Observed improvement not authorized in this run.>

## Open gate
<One unresolved decision/blocker, or `None`.>

## Next action
<Exactly one action.>
```

Target roughly 25–40 lines total. Keep one concise entry per role/mode under `Progress` — returned status plus artifact path or a one-line result, with no routing tables and no detailed findings. Update rather than append a chronological log. Preserve the original request, accepted decisions, superseding evidence, and unresolved follow-ups across compaction. Detailed audit or smoke-test findings go in the conversational report, not here, unless the Product Owner explicitly requested a separate audit artifact.

Under `Follow-up candidates`, list only improvements that are not already required by the skill, routing rules, or an agent contract. Before adding one, compare it against those rules; if the safeguard already exists, note it as already covered in the report and omit it here.

## Consistency check before routing

Before invoking the next role, verify:

- the returned status is valid for the role and mode;
- the artifact exists at the promised repository-root path;
- its requirements, trigger conditions, optional states, and terminology agree with the latest approved source;
- it does not treat an observation or recommendation as approved scope;
- it does not rely on evidence superseded by the Product Owner or current rendered behavior;
- it stayed within the role's authority;
- the proposed next role matches the status router.

If the issue is a bounded factual inconsistency in the producing role's artifact, resume that role for one targeted correction. If the issue exposes a real decision or missing evidence, use the corresponding gate instead of repeatedly polishing the document.
