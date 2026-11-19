import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { darkColors, lightColors, spacing, radii } from '../packages/ui/src/tokens.ts';

describe('Theme Selection & Design Tokens', () => {
  it('should have correct default dark palette colors per specification', () => {
    assert.equal(darkColors.backgroundPrimary, '#242321');
    assert.equal(darkColors.backgroundSecondary, '#302E2A');
    assert.equal(darkColors.accentPrimary, '#F28C28');
    assert.equal(darkColors.textPrimary, '#F4F1EB');
    assert.equal(darkColors.textSecondary, '#A8A39A');
    assert.equal(darkColors.border, '#45413B');
    assert.equal(darkColors.success, '#62B68A');
    assert.equal(darkColors.warning, '#E6AD54');
    assert.equal(darkColors.error, '#D86B63');
  });

  it('should define consistent spacing scale', () => {
    assert.equal(spacing.xs, 4);
    assert.equal(spacing.sm, 8);
    assert.equal(spacing.md, 12);
    assert.equal(spacing.lg, 16);
    assert.equal(spacing.xl, 20);
    assert.equal(spacing.xxl, 24);
  });

  it('should define card radii that avoid excessive pill shapes', () => {
    assert.equal(radii.md, 10);
    assert.equal(radii.lg, 14);
  });
});
