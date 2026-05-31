import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // RUO research-alias rename (Phase 2B): the GLP-1 SKUs moved off clinical
  // drug-name slugs to research-code aliases. 308-redirect the old paths so
  // any existing links / indexed URLs resolve.
  async redirects() {
    return [
      { source: '/products/semaglutide', destination: '/products/single-regulator', permanent: true },
      { source: '/products/retatrutide', destination: '/products/triple-regulator', permanent: true },
      { source: '/products/survodutide', destination: '/products/dual-regulator', permanent: true },
    ];
  },
};

export default nextConfig;
