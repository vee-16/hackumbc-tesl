import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.name = profile.name ?? token.name;
        token.email = (profile as any).email ?? token.email;
        token.picture = (profile as any).picture ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string | undefined;
        session.user.email = token.email as string | undefined;
        (session.user as any).picture = token.picture as string | undefined;
      }
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      if (!user?.email) return;

      const { error } = await supabaseAdmin
        .from("app_user")
        .upsert(
          [{ email: user.email, name: user.name ?? null }],
          { onConflict: "email", ignoreDuplicates: false }
        );

      if (error) {
        console.error("[NextAuth events.signIn] upsert app_user failed:", error);
      }
    },
  },
} satisfies NextAuthOptions;
