const USER_COOKIE = "learninghun_user_token";
const ADMIN_COOKIE = "learninghun_admin_token";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setUserAuthCookie(token: string) {
  setCookie(USER_COOKIE, token, MAX_AGE_SECONDS);
}

export function clearUserAuthCookie() {
  clearCookie(USER_COOKIE);
}

export function setAdminAuthCookie(token: string) {
  setCookie(ADMIN_COOKIE, token, MAX_AGE_SECONDS);
}

export function clearAdminAuthCookie() {
  clearCookie(ADMIN_COOKIE);
}

export function getUserAuthCookie() {
  return getCookie(USER_COOKIE);
}

export function getAdminAuthCookie() {
  return getCookie(ADMIN_COOKIE);
}
