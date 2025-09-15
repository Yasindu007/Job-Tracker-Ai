import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Token not found' }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { 
        token: token,
        expiresAt: { gt: new Date() }
      },
    });

    if (!verificationToken) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({ where: { id: verificationToken.id } });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/login?verified=true`);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}