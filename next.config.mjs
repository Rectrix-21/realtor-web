// next.config.mjs
const SUPABASE_HOST = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: SUPABASE_HOST,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
