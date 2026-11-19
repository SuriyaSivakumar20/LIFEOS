import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { APP_ROUTES } from '../packages/shared-types/src/index.ts';

describe('Application Navigation Structure', () => {
  it('should define exactly 5 primary mobile bottom bar destinations', () => {
    const primaryRoutes = APP_ROUTES.filter((r) => r.isPrimary);
    assert.equal(primaryRoutes.length, 5);
    const keys = primaryRoutes.map((r) => r.key);
    assert.deepEqual(keys, ['home', 'money', 'planner', 'habits', 'alfred']);
  });

  it('should contain all 8 specified destinations in full navigation', () => {
    assert.equal(APP_ROUTES.length, 8);
    const routes = APP_ROUTES.map((r) => r.route);
    assert.ok(routes.includes('/'));
    assert.ok(routes.includes('/money'));
    assert.ok(routes.includes('/planner'));
    assert.ok(routes.includes('/habits'));
    assert.ok(routes.includes('/alfred'));
    assert.ok(routes.includes('/journal'));
    assert.ok(routes.includes('/insights'));
    assert.ok(routes.includes('/settings'));
  });

  it('should have human readable labels for all screens', () => {
    for (const item of APP_ROUTES) {
      assert.ok(item.label.length > 0);
    }
  });
});
