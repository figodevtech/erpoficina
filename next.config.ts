import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',     // ou '**.supabase.co'
        port: '',
        pathname: '/storage/v1/object/public/**',

        // Next < 15.3.0: normalmente precisa existir ('' = NÃO permitir querystring)
        // Se você usa URLs assinadas (com ?token=...), remova essa linha pra permitir search params.
        search: '',
      },
    ],
  },
}

export default nextConfig;
