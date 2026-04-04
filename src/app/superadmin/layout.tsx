import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { SuperadminShell } from "./shell";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/login");
  }

  return <SuperadminShell>{children}</SuperadminShell>;
}
