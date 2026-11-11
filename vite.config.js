import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    // Own port so it can run next to the Portfolio-V2 prototype (5173).
    server: { port: 5180, strictPort: true },
});
