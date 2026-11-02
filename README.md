<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 百年孤独 · 记忆之书 2.0

在线游玩：https://gigige1999.github.io/-v2/

- `npm run dev`：本地开发
- `npm run build:pages`：构建线上版到 `docs/`（GitHub Pages 从 main 分支的 `/docs` 发布，不含任何 API 密钥）
- 设计说明见 [2.0策划案.md](2.0策划案.md)

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/417d9c6a-128d-4e55-85dc-ddcf1f9f046d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
