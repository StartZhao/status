/**
 * 自动导入常用的 API 和工具函数，减少手动导入的繁琐操作
 */
import AutoImport from "unplugin-auto-import/vite";

export default function createAutoImport() {
  return AutoImport({
    // 自动导入 vue、vue-router、pinia 等常用 API
    imports: ["vue", "vue-router", "pinia"],
    // 如果不需要生成类型声明文件，可以设置为 false
    dts: false,
    eslintrc: {
      // 如果不需要生成 ESLint 配置文件，可以设置为 false
      enabled: false,
    },
  });
}
