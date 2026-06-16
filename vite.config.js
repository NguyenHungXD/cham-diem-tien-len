import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png', 'robots.txt', 'sitemap.xml', 'humans.txt', 'browserconfig.xml'],
            manifest: {
                name: 'Chấm Điểm Tiến Lên',
                short_name: 'Tiến Lên',
                description: 'Web chấm điểm đánh bài Tiến Lên cho 4 người chơi. Tính điểm theo thứ hạng mỗi ván, cộng điểm thưởng, theo dõi điểm tích lũy và xác định người thắng chung cuộc. Hoạt động offline.',
                theme_color: '#2E3041',
                background_color: '#2E3041',
                display: 'standalone',
                orientation: 'any',
                icons: [
                    {
                        src: 'logo192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: 'logo512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                clientsClaim: true,
                skipWaiting: true,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            },
        }),
    ],
    build: {
        minify: 'esbuild',
    },
});
