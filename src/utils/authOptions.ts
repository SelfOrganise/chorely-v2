import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'password',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'you@email.com' },
        password: { label: 'Password', type: 'password', placeholder: '••••••' },
      },
      async authorize(options) {
        const user = await prisma?.user.findFirst({
          where: {
            email: options?.email,
            password: options?.password,
          },
        });

        if (!user) {
          return user;
        }

        return {
          ...user,
          name: user.displayName,
        };
      },
    }),
  ],
  theme: {
    colorScheme: 'dark',
  },
  session: {
    maxAge: 60 * 60 * 24 * 30 * 3, // token will expire after 3 months
  },
  callbacks: {
    jwt({ token }) {
      return token;
    },
    session({ session, token }) {
      session.user = { id: token.sub || 'invalid', email: token.email, name: token.name };

      return session;
    },
  },
};
