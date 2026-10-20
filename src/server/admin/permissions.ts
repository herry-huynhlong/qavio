import type {AdminRole} from '@prisma/client';
export const permissions={
  dashboard:['SUPER_ADMIN','ADMIN','EDITOR'],
  crm:['SUPER_ADMIN','ADMIN'],
  export:['SUPER_ADMIN'],
  subscribers:['SUPER_ADMIN','ADMIN'],
  email:['SUPER_ADMIN','ADMIN'],
  retry:['SUPER_ADMIN'],
  content:['SUPER_ADMIN','ADMIN','EDITOR'],
  publish:['SUPER_ADMIN','ADMIN'],
  settings:['SUPER_ADMIN'],
  accounts:['SUPER_ADMIN'],
  audit:['SUPER_ADMIN'],
  privacy:['SUPER_ADMIN'],
} satisfies Record<string,AdminRole[]>;
export type Permission=keyof typeof permissions;
export function allowed(role:AdminRole,permission:Permission){return (permissions[permission] as AdminRole[]).includes(role);}
