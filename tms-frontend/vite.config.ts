import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dns from "dns";

dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["chunk-UCMNR7HQ"], // Replace this with the actual dependency if identified
  },
  server: {
    host: true,
    port: 4200,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://backend:8080", // Your backend server
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, req, res) => {
            console.log("Proxy error:", err); // Logs proxy errors
          });
          // proxy.on("proxyReq", (proxyReq, req, res) => {
          //   console.log("Proxying request:", req.url); // Logs each proxied request
          // });
          // proxy.on("proxyRes", (proxyRes, req, res) => {
          //   console.log("Received response from target:", proxyRes.statusCode); // Logs the response status code
          // });
          // proxy.on("proxyReq", (proxyReq, req, _res) => {
          //   console.log(
          //     "Sending Request:",
          //     req.method,
          //     req.url,
          //     " => TO THE TARGET =>  ",
          //     proxyReq.method,
          //     proxyReq.protocol,
          //     proxyReq.host,
          //     proxyReq.path,
          //     JSON.stringify(proxyReq.getHeaders()),
          //   );
          // });
          // proxy.on("proxyRes", (proxyRes, req, _res) => {
          //   console.log(
          //     "Received Response from the Target:",
          //     proxyRes.statusCode,
          //     req.url,
          //     JSON.stringify(proxyRes.headers),
          //   );
          // });
        },
      },
      "/notifications": {
        target: "http://backend:8080", // Your backend server
        changeOrigin: true,
      },
      "/chat": {
        target: "http://backend:8080", // Your backend server
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://backend:8080", // Your backend server
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
