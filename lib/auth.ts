import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'
import TwitterProvider from 'next-auth/providers/twitter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateVerificationCode } from '@/lib/utils'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
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
    // signUp: '/auth/register', // You might want to add this too
  },
}

export async function sendVerificationEmail(email: string, code: string) {
  // This would integrate with your email service (SendGrid, AWS SES, etc.)
  // For now, we'll just log the code
  console.log(`Verification code for ${email}: ${code}`)
  
  // In production, you would send an actual email here
  // Example with nodemailer:
  
}

export async function createVerificationCode(email: string) {
  const code = generateVerificationCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.verificationCode.upsert({
    where: { email_code: { email, code } },
    update: { code, expiresAt },
    create: { email, code, expiresAt },
  })

  await sendVerificationEmail(email, code)
  return code
}

export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  const verificationCode = await prisma.verificationCode.findUnique({
    where: { email_code: { email, code } },
  })

  if (!verificationCode || verificationCode.code !== code) {
    return false
  }

  if (verificationCode.expiresAt < new Date()) {
    return false
  }

  // Delete the verification code after successful verification
  await prisma.verificationCode.delete({
    where: { email_code: { email, code } },
  })

  return true
}
