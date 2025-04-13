import nextMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure pageExtensions to include md and mdx
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Optionally, add any other Next.js config below
  reactStrictMode: true,
  // Add experimental flag if needed, e.g., for server actions
  // experimental: {
  //   serverActions: true,
  // },
};

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    // Add remark and rehype plugins here if needed globally
    // remarkPlugins: [],
    // rehypePlugins: [],
    // Or configure them per page using next-mdx-remote
  },
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
