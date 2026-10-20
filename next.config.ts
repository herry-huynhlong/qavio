import type { NextConfig } from "next";
const config: NextConfig = {
  output: "standalone",
  // Keep build workers within the dedicated VPS builder's memory budget.
  experimental: { cpus: 1 },
  outputFileTracingExcludes:{'/*':['./.runtime/**/*','./.test-artifacts/**/*','./.env*','./Qavio.png','./.git/**/*']},
  // Sharp 0.35 Windows needs adjacent libvips DLLs, not only the .node binary.
  outputFileTracingIncludes:{'/*':['./node_modules/.pnpm/@img+*/node_modules/@img/*/lib/**/*']},
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ...(process.env.SITE_INDEXING_ENABLED === 'true' ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }])
    ] },{source:'/admin/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'},{key:'Cache-Control',value:'private, no-store'}]},{source:'/api/admin/:path*',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'}]}];
  }
};
export default config;
