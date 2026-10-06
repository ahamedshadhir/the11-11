/** Demo store admin — same credentials as the original 11-11 README. */
export const ADMIN_EMAIL = "admin@1111.local";
export const ADMIN_PASSWORD = "admin123";
export const ADMIN_NAME = "Store Admin";

export function isAdminEmail(email?: string | null): boolean {
  return (email ?? "").trim().toLowerCase() === ADMIN_EMAIL;
}
