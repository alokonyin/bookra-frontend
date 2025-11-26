import type { Role } from "./roles";

export type User = {
  id: number;
  role: Role;
  email?: string | null;
  phone?: string | null;
};

const TOKEN_KEY = "bookra_token";
const USER_KEY = "bookra_user";


export function saveAuth(token: string, user: User) {
  localStorage.setItem("bookra_token", token);
  localStorage.setItem("bookra_user", JSON.stringify(user));
  // also mirror in cookies for middleware
  const isSecure = window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  const sameSiteFlag = isSecure ? '; SameSite=None' : '; SameSite=Lax';
  document.cookie = `bookra_token=${token}; path=/; max-age=${60 * 60 * 24}${secureFlag}${sameSiteFlag}`;
}
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "bookra_token=; Max-Age=0; path=/;";
}
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}
export function requireAuth(role?: Role): { ok: boolean; user?: User } {
  const token = getToken();
  const user = getUser();
  if (!token || !user) return { ok: false };
  if (role && user.role !== role) return { ok: false };
  return { ok: true, user };
}
