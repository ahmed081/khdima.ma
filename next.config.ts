import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

module.exports = {
    async rewrites() {
        return [
            {
                source: "/uploads/:path*",
                destination: "/public/uploads/:path*",
            },
        ];
    },
};
