/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // libheif-js dimuat saat runtime (bukan di-bundle webpack) sehingga wasm
    // ikut disalin dengan path aslinya ke output serverless.
    serverComponentsExternalPackages: ["heic-decode", "libheif-js"],
    outputFileTracingIncludes: {
      "/api/upload": [
        "./node_modules/libheif-js/libheif-wasm/libheif.wasm",
      ],
    },
  },
};
module.exports = nextConfig;
