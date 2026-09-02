# Routing

Choose the route from the request's actual risk and intent, not from how many roles are available.

## Route selection

### QUICK

Use only when all are true:

- implementation is explicitly allowed;
- the requested change is small, local, reversible, and well-defined;
- it adds no new product behavior or data meaning;
- it requires no schema, migration, dependency, permission, architecture, or material responsive/accessibility decision;
- current evidence is sufficient;
- no meaningful visual or product ambiguity remains.

Typical examples are a confirmed copy correction, an existing-token styling correction, or a tightly bounded bug whose expected behavior is already established.

Do not force a specialist-agent sequence. The main session may implement and verify the change directly using the same Git, data, scope, and verification safeguards as the developer agent. If classification becomes uncertain, promote to `STANDARD` before editing.

### STANDARD

Use for new behavior, meaningful UX/UI work, cross-surface changes, uncertain feasibility, data or CMS implications, or any change needing product and design judgment.

Default sequence:

1. Product Manager — briefing mode.
2. Product Designer — design planning mode.
3. Senior Fullstack Developer — feasibility mode only if the designer returns `READY FOR FEASIBILITY`.
4. Resume Product Designer for the UI pass.
5. Product Manager — product review mode.
6. Resume Product Designer to incorporate the PM result and mark the handoff ready.
7. Senior Fullstack Developer — implementation mode.
8. Product Designer — design review mode.
9. Developer corrections and design re-review while meaningful findings remain and progress is being made.
10. QA, when a QA agent exists. Until then stop at `READY FOR QA`, not `COMPLETE`.

Skip only a conditional step whose own trigger is absent. Do not skip a gate required by the receiving agent's contract.

### AUDIT/TEST

Use for `AUDIT EXISTING` and `SMOKE TEST`.

- Set authority to `ANALYSIS ONLY` unless the Product Owner separately authorizes a change.
- Define what is being evaluated: implementation, one role, handoff quality, routing, or the complete workflow.
- Invoke only roles needed to collect the requested evidence.
- A finding, recommendation, missing behavior, or failed check is an audit result, not permission to design or implement a fix.
- Do not turn the run into `STANDARD` silently. Offer a separate change only after the audit/test result is complete.
- A smoke test may stop at a named gate. Reaching that gate successfully is a test result; it does not require continuing to production implementation.

## Status router

### Product Manager — briefing

| Status | Next action |
| --- | --- |
| `READY FOR DESIGN` | Start Product Designer in design planning mode. |
| `PRODUCT DECISION REQUIRED` | Ask the Product Owner; record the decision; resume the PM to finalize. |
| `MISSING PRODUCT EVIDENCE` | Obtain only the requested product evidence; resume the PM. |

### Product Designer — planning

| Status | Next action |
| --- | --- |
| `READY FOR FEASIBILITY` | Start Developer in feasibility review mode with the exact questions. |
| `DESIGN DECISION REQUIRED` | Ask the Product Owner; record the decision; resume the designer. |
| `MISSING DESIGN EVIDENCE` | Obtain the requested rendered evidence; resume the designer. |
| `READY FOR PRODUCT REVIEW` | Start PM in product review mode. |
| `READY FOR DEVELOPMENT` | Start implementation only if PM review and every required decision are already recorded. |

### Developer — feasibility

| Status | Next action |
| --- | --- |
| `FEASIBLE` | Resume the designer for the UI pass. |
| `FEASIBLE WITH CONSTRAINTS` | Resume the designer with the exact constraints, without converting recommendations into requirements. |
| `PRODUCT OWNER DECISION REQUIRED` | Ask the Product Owner; record the decision; resume the designer or developer according to what the decision resolves. |
| `SPIKE APPROVAL REQUIRED` | Ask before any spike. Preserve feasibility's read-only boundary until approved. |
| `MISSING TECHNICAL EVIDENCE` | Resolve the stated access/evidence blocker or stop. |

### Product Manager — product review

| Status | Next action |
| --- | --- |
| `ALIGNED` | Resume the designer to record approval and mark `READY FOR DEVELOPMENT`. |
| `ALIGNED WITH APPROVED DEVIATIONS` | Resume the designer to incorporate each approved deviation once. |
| `PRODUCT OWNER APPROVAL REQUIRED` | Ask the Product Owner, then resume the PM or designer as appropriate. |

### Developer — implementation

| Status | Next action |
| --- | --- |
| `READY FOR REVIEW` | Start Product Designer in design review mode. |
| `CHANGES INCOMPLETE` | Resume the developer when remaining work is within scope; otherwise stop at the applicable gate. |
| `DESIGN REVISION REQUIRED` | Return to the designer; repeat product review when product behavior or scope may change. |
| `PRODUCT OWNER APPROVAL REQUIRED` | Ask the Product Owner before further mutation. |
| `BLOCKED` | Report the exact blocker and safe next action. |

### Product Designer — implementation review

| Status | Next action |
| --- | --- |
| `PASS` | Mark `READY FOR QA`, or invoke QA when available. |
| `PASS WITH POLISH` | Record non-blocking polish and mark `READY FOR QA`, or invoke QA when available. |
| `CHANGES REQUIRED` | Resume the developer with only `BLOCKER` and `MEANINGFUL` findings, then re-run design review. |
| `PRODUCT OWNER APPROVAL REQUIRED` | Ask the Product Owner before accepting or changing the implementation. |

Stop a correction loop when the same material finding repeats without new evidence or the required fix would exceed approved scope. Escalate the actual conflict instead of generating another identical pass.
