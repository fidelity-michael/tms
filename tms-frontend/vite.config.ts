import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dns from "dns";

dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 4200,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://backend:8080', // Your backend server
        changeOrigin: true,
      },
      '/notifications': {
        target: 'http://backend:8080', // Your backend server
        changeOrigin: true,
      },
      '/chat': {
        target: 'http://backend:8080', // Your backend server
        changeOrigin: true,
      },
    },
    configure: (proxy, options) => {
      proxy.on('error', (err, req, res) => {
        console.log('Proxy error:', err); // Logs proxy errors
      });
      proxy.on('proxyReq', (proxyReq, req, res) => {
        console.log('Proxying request:', req.url); // Logs each proxied request
      });
      proxy.on('proxyRes', (proxyRes, req, res) => {
        console.log('Received response from target:', proxyRes.statusCode); // Logs the response status code
      });
    },
  },
});
