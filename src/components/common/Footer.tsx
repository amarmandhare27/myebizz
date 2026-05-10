import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube, Heart } from "lucide-react";
import { Store } from "@/types";

interface FooterProps {
  store: Store;
  storeSlug: string;
}

export function Footer({ store, storeSlug }: FooterProps) {
  const socialLinks = [
    { icon: Instagram, href: store.instagramHandle ? `https://instagram.com/${store.instagramHandle}` : null, label: "Instagram" },
    { icon: Twitter, href: store.twitterHandle ? `https://twitter.com/${store.twitterHandle}` : null, label: "Twitter" },
    { icon: Facebook, href: store.facebookHandle ? `https://facebook.com/${store.facebookHandle}` : null, label: "Facebook" },
    { icon: Youtube, href: store.youtubeHandle ? `https://youtube.com/@${store.youtubeHandle}` : null, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-bold text-xl mb-3">{store.name}</h3>
            {store.description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {store.description}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-4">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={`/store/${storeSlug}`} className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href={`/store/${storeSlug}/products`} className="hover:text-foreground transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href={`/store/${storeSlug}/cart`} className="hover:text-foreground transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Return Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Powered with <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /> by{" "}
            <span className="font-semibold bg-instagram-gradient bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-600">
              MyeBizz
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
