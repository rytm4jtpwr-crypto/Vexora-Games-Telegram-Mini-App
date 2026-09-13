---
name: Telegram runtime modes
description: Development and production must not compete for the same Bot API update stream.
---

Run grammY with polling in the development workflow and webhook delivery in production.

**Why:** Telegram permits only one active update consumer per bot token. Running polling in both the workspace and published deployment causes 409 conflicts and can crash the deployment process.

**How to apply:** Keep production on `NODE_ENV=production` or explicit webhook mode, publish the webhook route with the API service, and avoid deleting the production webhook from the development process.