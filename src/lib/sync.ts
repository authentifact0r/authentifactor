/**
 * Triggers a rebuild of the tenant's external storefront (e.g. Astro site)
 * after product changes. Non-blocking — fires and forgets.
 */
export function triggerStorefrontSync(tenantSlug: string) {
  const hooks: Record<string, string> = {
    "styled-by-maryam": process.env.DEPLOY_HOOK_STYLED_BY_MARYAM || "",
  };

  const hookUrl = hooks[tenantSlug];
  if (!hookUrl) return;

  // Fire and forget — don't await, don't block the response
  fetch(hookUrl, { method: "POST" }).catch(() => {});
}
