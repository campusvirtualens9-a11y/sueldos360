import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: "gest-ar",
  project: "sueldos-360",
  silent: true,
  tunnelRoute: "/monitoring",
  sourcemaps: { disable: true },
});
