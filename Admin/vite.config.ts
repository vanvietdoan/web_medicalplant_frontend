import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";  // Thêm dòng này nếu chưa có

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "D:/DaiHoc/DATN/Admin/src": path.resolve(__dirname, "src"),  
    },
  },
});
