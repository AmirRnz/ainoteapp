import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prismal";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      async profile(profile) {
        // Check if user exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!existingUser) {
          // Create new user with Google auth
          const user = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name,
              googleId: profile.sub,
              emailVerified: new Date(), // Google emails are pre-verified
            },
          });
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }

        // If user exists but doesn't have googleId, update it
        if (!existingUser.googleId) {
          await prisma.user.update({
            where: { email: profile.email },
            data: { 
              googleId: profile.sub,
              emailVerified: existingUser.emailVerified || new Date(), // Ensure email is verified
            },
          });
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        };
      },
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);
        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        // Check if user exists with this email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // Create new user with email/password
          const hashedPassword = await bcrypt.hash(password, 10);
          const verifyToken = crypto.randomBytes(32).toString("hex");
          const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          const newUser = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              verifyToken,
              verifyTokenExpiry,
            },
          });

          // Send verification email
          await sendVerificationEmail(email, verifyToken);

          throw new Error("Please check your email to verify your account.");
        }

        // If user exists but doesn't have password, throw error
        if (!user.password) {
          throw new Error("This email is registered with Google. Please sign in with Google.");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in.");
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
