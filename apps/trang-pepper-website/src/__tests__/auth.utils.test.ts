import { describe, it, expect, vi } from 'vitest';

// mock prisma to avoid loading the real client during tests
vi.mock('../lib/prisma', () => ({
  default: {},
}));

import { can } from '../lib/auth/utils';
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLE_NAMES } from '../lib/auth/constants';
import type { Session } from 'next-auth';

function createSession(
  role: string,
  permissions: Record<string, Record<string, boolean>>,
): Session {
  return {
    user: {
      id: 'user1',
      name: 'Test User',
      email: 'user@example.com',
      role,
      permissions,
    },
    expires: new Date().toISOString(),
  } as Session;
}

describe('can function', () => {
  it('allows SUPERADMIN for any action', () => {
    const session = createSession(ROLE_NAMES.SUPERADMIN, {});
    const result = can(session, PERMISSION_RESOURCES.USER, PERMISSION_ACTIONS.CREATE);
    expect(result).toBe(true);
  });

  it('denies when permission missing', () => {
    const session = createSession('EDITOR', {});
    const result = can(session, PERMISSION_RESOURCES.USER, PERMISSION_ACTIONS.CREATE);
    expect(result).toBe(false);
  });

  it('allows when permission exists', () => {
    const perms = {
      [PERMISSION_RESOURCES.USER]: {
        [PERMISSION_ACTIONS.CREATE]: true,
      },
    };
    const session = createSession('EDITOR', perms);
    const result = can(session, PERMISSION_RESOURCES.USER, PERMISSION_ACTIONS.CREATE);
    expect(result).toBe(true);
  });
});
