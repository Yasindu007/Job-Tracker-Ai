import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // TODO: Send email with password reset link
    console.log(`Password reset token for ${email}: ${token}`);

    return NextResponse.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
