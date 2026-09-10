export type HolofoilAccessLevel = 'GUEST' | 'MEMBER' | 'INTERNAL';

export type HolofoilCapability =
  | 'holofoil.material.use'
  | 'holofoil.card-studio.use'
  | 'holofoil.3d-stage.use'
  | 'holofoil.project.create'
  | 'origin.playable-slice.request'
  | 'creator.game-package.request'
  | 'internal.proofs.view';

export interface HolofoilAccessContext {
  authenticated: boolean;
  membership: 'NONE' | 'MEMBER';
  internal: boolean;
  capabilities: HolofoilCapability[];
  source: 'PRODUCTION' | 'FIXTURE';
}

export function accessLevel(ctx: HolofoilAccessContext): HolofoilAccessLevel {
  if (ctx.authenticated && ctx.internal && ctx.capabilities.includes('internal.proofs.view')) return 'INTERNAL';
  if (ctx.authenticated && ctx.membership === 'MEMBER') return 'MEMBER';
  return 'GUEST';
}

export function canUse(ctx: HolofoilAccessContext, capability: HolofoilCapability): boolean {
  if (!ctx.authenticated) return false;
  return ctx.capabilities.includes(capability);
}

export function canViewInternalProofs(ctx: HolofoilAccessContext): boolean {
  return accessLevel(ctx) === 'INTERNAL' && canUse(ctx, 'internal.proofs.view');
}

export function assertNoProjectLeak(ctx: HolofoilAccessContext): void {
  if (ctx.source === 'FIXTURE' && accessLevel(ctx) !== 'INTERNAL') {
    throw new Error('HOLOFOIL_FIXTURE_DATA_NOT_PUBLIC');
  }
}
