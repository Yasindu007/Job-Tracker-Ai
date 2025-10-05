import { StackClientApp } from "@stackframe/stack";

export const client = new StackClientApp({
  urls: { handler: "/handler" },
  tokenStore: "nextjs-cookie",
  // Read project configuration from environment
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
});

export const auth = client;
export const useUser = client.useUser.bind(client);