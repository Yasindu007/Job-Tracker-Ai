import "server-only";

import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: { handler: "/handler" },
  // Read configuration from environment when available
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  secretKey: process.env.STACK_SECRET_KEY || process.env.STACK_APP_SECRET,
});
