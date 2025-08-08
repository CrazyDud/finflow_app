/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
  async headers() {
    const csp = [
      "default-src 'self'",
      // Allow Google Translate and eval required by it
      "script-src 'self' 'unsafe-eval' https://translate.google.com https://translate.googleapis.com",
      // Inline styles are injected by the widget
      "style-src 'self' 'unsafe-inline' https://translate.googleapis.com https://fonts.googleapis.com",
      // Images and data URIs
      "img-src 'self' data: https://translate.google.com https://translate.googleapis.com",
      // Fonts
      "font-src 'self' data: https://fonts.gstatic.com",
      // Iframes used by the widget
      "frame-src 'self' https://translate.google.com https://translate.googleapis.com",
      // XHR/fetch
      "connect-src 'self' https://translate.google.com https://translate.googleapis.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'interest-cohort=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
