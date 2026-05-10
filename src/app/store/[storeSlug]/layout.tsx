import { notFound } from "next/navigation";
import { Metadata } from "next";
import { storesApi } from "@/lib/api/stores";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Store } from "@/types";

// Mock store for SSR when API is not available
async function getStore(slug: string): Promise<Store | null> {
  try {
    return await storesApi.getStoreBySlug(slug);
  } catch {
    // Return mock store for development
    return {
      id: "1",
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1) + " Store",
      tagline: "Premium merch for your fans",
      description: "Official merchandise store. Get exclusive products curated just for you.",
      logoUrl: undefined,
      bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
      primaryColor: "#6366f1",
      secondaryColor: "#f1f5f9",
      accentColor: "#ec4899",
      ownerId: "1",
      ownerName: slug,
      ownerAvatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200`,
      instagramHandle: slug,
      twitterHandle: slug,
      facebookHandle: undefined,
      youtubeHandle: undefined,
      status: "active",
      plan: "pro",
      currency: "INR",
      country: "IN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await getStore(storeSlug);
  if (!store) return { title: "Store Not Found" };

  return {
    title: store.seoTitle || `${store.name} – Official Store`,
    description: store.seoDescription || store.description,
    openGraph: {
      title: store.name,
      description: store.description,
      images: store.bannerUrl ? [store.bannerUrl] : [],
    },
  };
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const store = await getStore(storeSlug);

  if (!store || store.status === "suspended") {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar store={store} storeSlug={storeSlug} />
      <main className="flex-1">{children}</main>
      <Footer store={store} storeSlug={storeSlug} />
    </div>
  );
}
