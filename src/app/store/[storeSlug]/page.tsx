import { HeroBanner } from "@/components/store/HeroBanner";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { CategoryGrid } from "@/components/store/CategoryGrid";
import { CreatorBranding } from "@/components/store/CreatorBranding";

// Mock data for demo
const mockStore = {
  id: "1",
  slug: "demo",
  name: "Demo Store",
  tagline: "Premium merch for your fans",
  description: "Official merchandise store. Get exclusive products curated just for you.",
  bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
  primaryColor: "#6366f1",
  accentColor: "#ec4899",
  ownerName: "Creator",
  ownerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  instagramHandle: "demo_creator",
  currency: "INR",
};

const mockCategories = [
  { id: "1", name: "T-Shirts", slug: "t-shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", productCount: 12 },
  { id: "2", name: "Hoodies", slug: "hoodies", image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400", productCount: 8 },
  { id: "3", name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=400", productCount: 15 },
  { id: "4", name: "Caps", slug: "caps", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400", productCount: 6 },
];

const mockProducts = [
  {
    id: "1", storeId: "1", name: "Premium Graphic Tee", slug: "premium-graphic-tee",
    description: "High quality cotton graphic tee", shortDescription: "Premium cotton",
    price: 1299, discountPrice: 999, discountPercent: 23,
    images: [{ id: "1", url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600", altText: "Tee", isPrimary: true, sortOrder: 0 }],
    category: "T-Shirts", tags: ["trending"], variants: [], stockCount: 50,
    sku: "TEE-001", isFeatured: true, isPublished: true, rating: 4.5, reviewCount: 123, soldCount: 89,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "2", storeId: "1", name: "Signature Hoodie", slug: "signature-hoodie",
    description: "Cozy signature hoodie", shortDescription: "Cozy hoodie",
    price: 2499, discountPrice: undefined, discountPercent: 0,
    images: [{ id: "2", url: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600", altText: "Hoodie", isPrimary: true, sortOrder: 0 }],
    category: "Hoodies", tags: ["bestseller"], variants: [], stockCount: 30,
    sku: "HOD-001", isFeatured: true, isPublished: true, rating: 4.8, reviewCount: 67, soldCount: 45,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "3", storeId: "1", name: "Creator Cap", slug: "creator-cap",
    description: "Stylish creator cap", shortDescription: "Stylish cap",
    price: 799, discountPrice: 599,
    images: [{ id: "3", url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600", altText: "Cap", isPrimary: true, sortOrder: 0 }],
    category: "Caps", tags: ["new"], variants: [], stockCount: 100,
    sku: "CAP-001", isFeatured: true, isPublished: true, rating: 4.2, reviewCount: 34, soldCount: 78,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "4", storeId: "1", name: "Phone Case", slug: "phone-case",
    description: "Premium phone case", shortDescription: "Premium case",
    price: 499, discountPrice: 349,
    images: [{ id: "4", url: "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=600", altText: "Case", isPrimary: true, sortOrder: 0 }],
    category: "Accessories", tags: [], variants: [], stockCount: 200,
    sku: "ACC-001", isFeatured: false, isPublished: true, rating: 4.0, reviewCount: 89, soldCount: 156,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

export default async function StorePage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;

  return (
    <div className="space-y-0">
      <HeroBanner
        store={mockStore as Parameters<typeof HeroBanner>[0]["store"]}
        storeSlug={storeSlug}
      />
      <CreatorBranding
        ownerName={mockStore.ownerName}
        ownerAvatar={mockStore.ownerAvatar}
        instagramHandle={mockStore.instagramHandle}
        description={mockStore.description}
      />
      <CategoryGrid categories={mockCategories} storeSlug={storeSlug} />
      <FeaturedProducts
        products={mockProducts as Parameters<typeof FeaturedProducts>[0]["products"]}
        storeSlug={storeSlug}
        currency={mockStore.currency}
      />
    </div>
  );
}
