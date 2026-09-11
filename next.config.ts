import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev-only "N" badge defaults to bottom-left, where it sits on the
  // sidebar's Collapse / Expand button. Production never shows it.
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
