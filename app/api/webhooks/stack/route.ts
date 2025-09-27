import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.STACK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add STACK_WEBHOOK_SECRET from Stack Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses[0]?.email_address;
    if (!email) {
      return new Response('Error: No email address found for new user', { status: 400 });
    }

    await prisma.user.create({
      data: {
        id: id,
        email: email,
        name: `${first_name} ${last_name}`,
        image: image_url,
      },
    });

    return new Response('User created', { status: 201 });
  }

  return new Response('', { status: 200 })
}
