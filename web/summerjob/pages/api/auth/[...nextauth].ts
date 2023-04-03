import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "lib/prisma/connection";
import { createTransport } from "nodemailer";
import { emailHtml, emailText } from "lib/auth/auth";
import { getUserByEmail, getUserById } from "lib/data/users";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      // maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h)
      async sendVerificationRequest({
        identifier: email,
        url,
        token,
        provider,
      }) {
        // In dev, emails are not sent, user is automatically signed in
        if (process.env.NODE_ENV !== "production") {
          return;
        }
        const { host } = new URL(url);
        // NOTE: You are not required to use `nodemailer`, use whatever you want.
        const transport = createTransport(provider.server);
        const result = await transport.sendMail({
          to: email,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: emailText({ url, host }),
          html: emailHtml({ url, host }),
        });
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      },
    }),
  ],
  callbacks: {
    async signIn(params) {
      if (!params.user.email) return false;
      const user = await getUserByEmail(params.user.email);
      if (!user || user.blocked || user.deleted) return false;
      return true;
    },
    async session({ session, user }) {
      const userRecord = await getUserByEmail(user.email);
      if (!userRecord) return session;

      const extended = {
        ...session,
        userID: userRecord.id,
        username: `${userRecord.firstName} ${userRecord.lastName}`,
        permissions: userRecord.permissions,
      };

      return extended;
    },
  },
  pages: {
    signIn: "/auth/signIn",
    verifyRequest: "/auth/checkEmail",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);
