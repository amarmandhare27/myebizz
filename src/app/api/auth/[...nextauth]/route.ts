import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

function normalizeRole(role: unknown): string {
  const normalized = String(role ?? "")
    .toLowerCase()
    .replace(/[-\s]/g, "_")
    .trim();

  if (normalized === "superadmin") return "super_admin";
  if (normalized === "administrator") return "admin";

  return normalized;
}

// Dev mock accounts (only used when NEXT_PUBLIC_API_URL is unavailable)
const DEV_ACCOUNTS = [
  { email: "admin@demo.com", password: "admin123", id: "1", name: "Admin User", role: "admin", image: "" },
  { email: "superadmin@demo.com", password: "super123", id: "2", name: "Super Admin", role: "super_admin", image: "" },
  { email: "user@demo.com", password: "user123", id: "3", name: "Demo User", role: "user", image: "" },
];

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const data = await res.json();
          if (!data.user) return null;

          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: normalizeRole(data.user.role),
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            image: data.user.avatar,
          };
        } catch {
          // Fall back to dev mock accounts when API is unavailable
          const mock = DEV_ACCOUNTS.find(
            (a) => a.email === credentials.email && a.password === credentials.password
          );
          if (mock) {
            return { id: mock.id, name: mock.name, email: mock.email, role: normalizeRole(mock.role), image: mock.image };
          }
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
