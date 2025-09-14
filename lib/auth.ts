import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import TwitterProvider from 'next-auth/providers/twitter'
import FacebookProvider from 'next-auth/providers/facebook'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { ratelimit } from '@/lib/ratelimit'

const providers: any[] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: "Email", type: "email" },
      password: {  label: "Password", type: "password" }
    },
    async authorize(credentials, req) {
      const ip = req.headers?.['x-forwarded-for'] || '127.0.0.1'
      const { success } = await ratelimit.limit(ip)
      if (!success) {
        throw new Error('Too many requests')
      }

      if (!credentials?.email || !credentials.password) {
        return null
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      })

      if (!user || !user.password) {
        return null
      }

      if (!user.emailVerified) {
        throw new Error('Email not verified')
      }

      const isValid = await bcrypt.compare(credentials.password, user.password)

      if (isValid) {
        return user
      } else {
        return null
      }
    }
  })
]

// Email Provider for magic link login (SMTP method)
if (
  process.env.EMAIL_SERVER_HOST &&
  process.env.EMAIL_SERVER_PORT &&
  process.env.EMAIL_SERVER_USER &&
  process.env.EMAIL_SERVER_PASSWORD &&
  process.env.EMAIL_FROM
) {
  providers.push(
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    })
  )
}

// OAuth Providers
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  )
}

if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
  providers.push(
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: "2.0", // Twitter API v2
    })
  )
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    verifyRequest: '/auth/verify-request',
  },
  events: {
    
    async signIn(message) {
      console.log('NEXTAUTH_SIGN_IN_EVENT', message)
    },
  }
}
