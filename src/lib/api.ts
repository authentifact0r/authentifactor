/**
 * Build an API URL that preserves the ?tenant= param from the current page.
 * This ensures middleware sets x-tenant-slug for API routes.
 */
export function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  const params = new URLSearchParams(window.location.search);
  const tenant = params.get("tenant");
  if (tenant) {
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}tenant=${tenant}`;
  }
  return path;
}
