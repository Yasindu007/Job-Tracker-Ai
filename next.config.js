/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is a workaround for a bug in a dependency of `@stackframe/stack`.
  // We are telling Next.js to transpile these packages to help resolve the issue.
  transpilePackages: ['@stackframe/stack', '@stackframe/stack-ui', 'lucide-react'],
};

module.exports = nextConfig;
