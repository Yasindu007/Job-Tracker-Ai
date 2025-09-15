import { createStack } from "@stackframe/stack";

export const { auth, useUser, client } = createStack({
  serverApp: "/handler",
});