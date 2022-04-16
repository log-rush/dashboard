import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

export enum Permission {
  Test1,
  Test2,
}

const PermissionDefinitions: Record<Permission, number> = {
  [Permission.Test1]: 0b1,
  [Permission.Test2]: 0b10,
};

export const createPermissions = (...permissions: Permission[]): number => {
  let finalPermission = 0;
  for (const permission of permissions) {
    finalPermission |= PermissionDefinitions[permission];
  }
  return finalPermission;
};

export const usePermissions = () => {
  const auth = useAuthStore();

  const hasPermission1 = computed(
    () =>
      (auth.permissions.value & PermissionDefinitions[Permission.Test1]) > 0,
  );
  const hasPermission2 = computed(
    () =>
      (auth.permissions.value & PermissionDefinitions[Permission.Test2]) > 0,
  );

  return {
    hasPermission1,
    hasPermission2,
  };
};
