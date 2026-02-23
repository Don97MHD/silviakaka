const withImages = require('next-images')
const nextComposePlugins = require('next-compose-plugins');
const { withPlugins } = nextComposePlugins.extend(() => ({}));
const withTM = require('next-transpile-modules')(['flotiq-components-react'])

module.exports = withPlugins(
    [
        withTM,
        withImages,
    ],
    {
        async rewrites() {
            return [
                {
                    // Update: removed silviakaka and kladdkaka from the negative lookahead
                    // Now, URLs like /silviakaka will be correctly rewritten to be handled by the category page.
                    source: '/:slug((?!recept|om-oss|kontakta-oss|sok|iwings-admin|api|_next|sitemap\\.xml).*)',
                    destination: '/kategorier/:slug',
                },
            ];
        },

        images: {
            imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
            dangerouslyAllowSVG: true,
            disableStaticImages: true,
            remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/images/**',
            },
            
            {
                 protocol: 'https',
                 hostname: 'silviakaka.se',
                port: '',
                pathname: '/images/**',
         },
        ],
        },
        webpack: (config, options) => {
            if (!options.isServer) {
                // config.resolve.alias['@sentry/node'] = '@sentry/browser'
            }
            config.module.rules.push({
                test: /\.svg$/,
                issuer: { and: [/\.(js|ts)x?$/] },
                use: ['@svgr/webpack'],
            });
            return config;
        },
    }
);