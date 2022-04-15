import { Ref, ref } from 'vue';
import { createPermissions, Permission } from '../services/permissions';

export type AuthStore = {
  isLoggedIn: Ref<boolean>;
  username: Ref<string | undefined>;
  userId: Ref<string | undefined>;
  permissions: Ref<number>;
  login(key: string): Promise<void>;
  logout(): Promise<void>;
};

const isLoggedIn = ref(true); // TODO
const username = ref<string | undefined>(undefined);
const userId = ref<string | undefined>(undefined);
const permissions = ref(0);

async function login(key: string) {
  username.value = 'test';
  userId.value = key;
  isLoggedIn.value = true;
  permissions.value = createPermissions(Permission.Test1, Permission.Test2);
}

async function logout() {
  username.value = undefined;
  userId.value = undefined;
  isLoggedIn.value = true;
  permissions.value = 0;
}

const AuthStore = {
  isLoggedIn,
  username,
  userId,
  permissions,
  login,
  logout,
};

export const useAuthStore = (): AuthStore => AuthStore;
