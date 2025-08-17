// next.config.mjs
const SUPABASE_HOST = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: SUPABASE_HOST, // e.g. abcdxyz.supabase.co
        pathname: "/storage/v1/object/public/**", // your public buckets
      },
    ],
    // or simpler: domains: [SUPABASE_HOST],
  },
};

export default nextConfig;
