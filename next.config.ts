// Propósito: Configura las capacidades de Next.js y el cargador Tailwind de Turbopack.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilita el renderizado incremental por componentes y la prelectura parcial de rutas.
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      // Procesa hojas de estilo con el plugin de Tailwind compatible con Turbopack.
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
