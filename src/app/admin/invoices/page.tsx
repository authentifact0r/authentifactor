export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth";
import { InvoiceManager } from "./invoice-manager";

export default async function InvoicesPage() {
  await requireAdmin();
  return <InvoiceManager />;
}
