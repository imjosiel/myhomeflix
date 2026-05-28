// Authorization utilities
import { auth } from '@/auth';
import type { AppRole } from '@/auth';

export async function requireRole(required: AppRole | AppRole[]) {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }
  
  const roles = session.user.roles ?? [];
  const requiredRoles = Array.isArray(required) ? required : [required];
  const hasRole = requiredRoles.some((r) => roles.includes(r));

  if (!hasRole) {
    return null;
  }

  return session;
}

export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }
  
  return session;
}

export function hasRole(userRoles: string[], required: AppRole | AppRole[]): boolean {
  const requiredRoles = Array.isArray(required) ? required : [required];
  return requiredRoles.some((r) => userRoles.includes(r));
}

export function isAdmin(userRoles: string[]): boolean {
  return userRoles.includes('admin');
}

export function isModerador(userRoles: string[]): boolean {
  return userRoles.includes('moderador');
}

export function isEditor(userRoles: string[]): boolean {
  return userRoles.includes('editor');
}

export function canUploadVideos(userRoles: string[]): boolean {
  return userRoles.some(r => ['admin', 'moderador', 'editor'].includes(r));
}
