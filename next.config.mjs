/** @type {import('next').NextConfig} */
const nextConfig = {
  // pageExtensions removed as MDX is handled by next-mdx-remote in app router
  // Optionally, add any other Next.js config below
  reactStrictMode: true,
  // Add experimental flag if needed, e.g., for server actions
  // experimental: {
  //   serverActions: true,
  // },
};

// Removed withMDX wrapper
export default nextConfig;
