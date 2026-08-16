import { describe, expect, it } from 'vitest';
import { parsePrBody } from '../worker/desk';

describe('material-form Desk parsing', () => {
  it('uses Form decision Public tier even when earlier audit prose names another tier', () => {
    const body = `## Material Audit

### Density judgment
- Supported by this material: note
- Why: the research alone might look like tier: essay, but the author-owned material is narrow.

## Form decision
- Chosen form: field-note
- Public tier: note
- Strongest available material: one firsthand verification case
- Material deliberately not expanded: the broader causal theory
`;

    expect(parsePrBody(body).tier).toBe('note');
  });

  it('accepts Tracker as an explicit form decision', () => {
    const body = `## Material Audit

### Density judgment
- Supported by this material: tracker
- Why: a published prediction now has enough new evidence to score.

## Form decision
- Chosen form: tracker
- Public tier: tracker
- Strongest available material: new evidence against the published prediction
- Material deliberately not expanded: a new general theory
`;

    expect(parsePrBody(body).tier).toBe('tracker');
  });
});
