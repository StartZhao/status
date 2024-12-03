import { defineConfig, loadEnv } from "vite";
import path from "path";
import createVitePlugins from "./vite-plugins";

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const { VITE_BASE_URL } = env;
  return {
    // 基础路径,如果环境指定基础路径，则使用环境变量的值，否则默认为根路径
    base: VITE_BASE_URL === undefined ? "/" : VITE_BASE_URL,
    plugins: createVitePlugins(command, command === "build"),
    // 解析配置
    resolve: {
      alias: {
        // 设置路径
        "~": path.resolve(__dirname, "./"),
        // 设置别名
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    },
    // 服务配置
    server: {
      port: 80,
      open: true,
      proxy: {
        // 代理配置，解决跨域问题
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
