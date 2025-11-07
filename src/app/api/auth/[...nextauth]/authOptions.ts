import { AuthOptions, User as NextAuthUser } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

// Extend User and AdapterUser types to include phone and zone
declare module "next-auth" {
  interface User {
    phone?: string;
    zone?: string;
    verified: boolean;
    role: string;
  }
  interface Session {
    user: {
      id: string;
      role: "CLIENTE" | "TRABAJADOR" | "ADMIN";
      verified: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string;
      zone?: string;
    };
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    phone?: string;
    zone?: string;
    verified?: boolean;
    role?: "CLIENTE" | "TRABAJADOR" | "ADMIN";
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          verified: user.verified,
          role: user.role,
          phone: user.phone,
          zone: user.zone,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "CLIENTE";
        token.verified = user.verified ?? false;
        token.phone = user.phone;
        token.zone = user.zone;
      }
      return {
        ...token,
        role: token.role ?? "CLIENTE",
        verified: token.verified ?? false,
      };
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CLIENTE" | "TRABAJADOR" | "ADMIN";
        session.user.verified = token.verified as boolean;
        // Extend session.user at runtime to include phone and zone
        (session.user as typeof session.user & { phone?: string; zone?: string }).phone = token.phone as string;
        (session.user as typeof session.user & { phone?: string; zone?: string }).zone = token.zone as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/api/auth")) {
        return `${baseUrl}/confirm`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
