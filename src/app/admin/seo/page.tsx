export const dynamic = "force-dynamic";

import { getScopedDb, TENANT_ID } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Globe } from "lucide-react";

async function saveSeoSettings(formData: FormData) {
  "use server";
  await requireAdmin();
  const tdb = await getScopedDb();

  const pageType = formData.get("pageType") as string;
  const pageSlug = (formData.get("pageSlug") as string) || null;
  const metaTitle = (formData.get("metaTitle") as string) || null;
  const metaDescription = (formData.get("metaDescription") as string) || null;
  const ogImage = (formData.get("ogImage") as string) || null;
  const canonicalUrl = (formData.get("canonicalUrl") as string) || null;
  const noIndex = formData.get("noIndex") === "on";

  await tdb.seoSettings.upsert({
    where: {
      tenantId_pageType_pageSlug: {
        tenantId: TENANT_ID,
        pageType,
        pageSlug: pageSlug ?? "",
      },
    },
    update: {
      metaTitle,
      metaDescription,
      ogImage,
      canonicalUrl,
      noIndex,
    },
    create: {
      tenantId: TENANT_ID, // injected by scoped client
      pageType,
      pageSlug,
      metaTitle,
      metaDescription,
      ogImage,
      canonicalUrl,
      noIndex,
    },
  });

  revalidatePath("/admin/seo");
}

async function deleteSeoSetting(formData: FormData) {
  "use server";
  await requireAdmin();
  const tdb = await getScopedDb();
  const id = formData.get("id") as string;
  await tdb.seoSettings.delete({ where: { id } });
  revalidatePath("/admin/seo");
}

export default async function SeoAdminPage() {
  await requireAdmin();
  const tdb = await getScopedDb();

  const settings = await tdb.seoSettings.findMany({
    orderBy: { pageType: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SEO Settings</h1>
          <p className="text-sm text-gray-500">
            Manage meta tags, Open Graph, and indexing for your store pages.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Globe className="h-5 w-5" />
        </div>
      </div>

      {/* Existing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Current SEO Rules
            <Badge variant="secondary">{settings.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No SEO settings configured yet. Add your first rule below.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page Type</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Meta Title</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead>Index</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Badge variant="outline">{s.pageType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {s.pageSlug || "--"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm font-medium">
                      {s.metaTitle || "--"}
                    </TableCell>
                    <TableCell className="hidden max-w-[250px] truncate text-sm text-gray-500 md:table-cell">
                      {s.metaDescription || "--"}
                    </TableCell>
                    <TableCell>
                      {s.noIndex ? (
                        <Badge variant="destructive">No Index</Badge>
                      ) : (
                        <Badge variant="success">Indexed</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <form action={deleteSeoSetting}>
                        <input type="hidden" name="id" value={s.id} />
                        <Button variant="ghost" size="sm" type="submit">
                          Remove
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add SEO Rule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveSeoSettings} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Page Type</label>
                <Select name="pageType" required>
                  <option value="">Select page type...</option>
                  <option value="home">Home</option>
                  <option value="category">Category</option>
                  <option value="product">Product</option>
                  <option value="recipe">Recipe</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Page Slug{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  name="pageSlug"
                  placeholder="e.g. jollof-rice-mix"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Title</label>
              <Input
                name="metaTitle"
                placeholder="Page title for search engines (50-60 chars ideal)"
                maxLength={70}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Description</label>
              <textarea
                name="metaDescription"
                placeholder="Short description for search results (150-160 chars ideal)"
                maxLength={170}
                rows={3}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">OG Image URL</label>
                <Input
                  name="ogImage"
                  type="url"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Canonical URL</label>
                <Input
                  name="canonicalUrl"
                  type="url"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="noIndex"
                id="noIndex"
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="noIndex" className="text-sm font-medium">
                No Index (hide from search engines)
              </label>
            </div>

            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Save SEO Rule
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
