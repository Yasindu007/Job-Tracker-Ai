import { StackClientApp } from "@stackframe/stack";

export const client = new StackClientApp({
  urls: { handler: "/auth" },
  tokenStore: "nextjs-cookie",
  // You might need to add projectId, publishableClientKey here from your .env.local
  // projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  // publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
});

export const auth = client;
export const useUser = client.useUser;