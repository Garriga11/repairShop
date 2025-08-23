// lib/auth.ts or components/auth.ts

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma"; // Adjust if path differs

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing email or password");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            roleId: true,
            role: {
              select: {
                name: true,
              }
            }
          },
        });

        if (!user) {
          console.error("User not found");
          return null;
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          console.error("Invalid password");
          return null;
        }

        console.log("🔍 Auth Debug - User found:", {
          id: user.id,
          email: user.email,
          roleId: user.roleId,
          roleName: user.role?.name
        });

        return {
          id: user.id,
          name: user.name ?? "User",
          email: user.email,
          role: user.role?.name || 'USER', // Use actual role name from Role table
          roleId: user.roleId, // Keep roleId for compatibility
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.role = (user as any).role || 'USER'; // Use actual role name from Role table
        token.roleId = (user as any).roleId; // Store roleId separately for compatibility
        
        console.log("🔍 JWT Debug - Token created:", {
          email: token.email,
          role: token.role,
          roleId: token.roleId
        });
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        (session.user as any).roleId = token.roleId as string; // Add roleId to session
        
        console.log("🔍 Session Debug - Session created:", {
          email: session.user.email,
          role: session.user.role,
          roleId: (session.user as any).roleId
        });
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },
};
