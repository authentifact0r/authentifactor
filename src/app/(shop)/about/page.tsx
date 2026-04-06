import { getTenant } from "@/lib/tenant";
import { AboutPageClient } from "./about-client";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const tenant = await getTenant();

  if (!tenant.brandStory) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-400 text-sm">No brand story yet.</p>
      </div>
    );
  }

  return (
    <AboutPageClient
      name={tenant.name}
      story={tenant.brandStory}
      image={tenant.brandStoryImage}
      accentColor={tenant.accentColor}
      textColor={tenant.textColor}
      backgroundColor={tenant.backgroundColor}
      tagline={tenant.tagline}
    />
  );
}
