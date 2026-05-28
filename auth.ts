// NextAuth.js v5 configuration with JWT session strategy
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import type { User as PrismaUser } from '@prisma/client';

// Define app roles
export type AppRole = 'admin' | 'moderador' | 'editor';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  
  // Using JWT session strategy
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      
      // Assign default role on profile creation
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          roles: ['editor'], // Default role for new users
        };
      },
      
      // Optional: For refresh tokens
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  
  callbacks: {
    // JWT callback - called when JWT is created or updated
    async jwt({ token, user, account, profile, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        
        // Get or create user in database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, roles: true },
        });
        
        if (dbUser) {
          token.roles = dbUser.roles;
        } else {
          // Create user if doesn't exist
          const newUser = await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              name: user.name,
              image: user.image,
              roles: ['editor'], // Default role
              emailVerified: new Date(),
            },
          });
          token.roles = newUser.roles;
        }
      }
      
      // Update trigger - refresh roles from database
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { roles: true },
        });
        if (dbUser) {
          token.roles = dbUser.roles;
        }
      }
      
      return token;
    },
    
    // Session callback - called whenever session is checked
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as string[]) ?? [];
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  
  debug: process.env.NODE_ENV === 'development',
});
