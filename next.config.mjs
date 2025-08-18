// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Add Supabase image patterns when configured
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL ? [{
        protocol: "https",
        hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
        pathname: "/storage/v1/object/public/**",
      }] : []),
    ],
  },
};

export default nextConfig;
