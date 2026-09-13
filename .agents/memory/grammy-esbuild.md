---
name: grammY with the API bundler
description: The server bundle must leave grammY external so its Node platform module resolves correctly at runtime.
---

When grammY is used in the esbuild-based API server, keep `grammy` in the bundle's external dependency list.

**Why:** grammY's Node build loads a sibling `platform.node` module through a runtime-relative require. Inlining the package into the server bundle breaks that relative lookup even though TypeScript and esbuild both pass.

**How to apply:** If the Telegram bot is moved or expanded, preserve the externalization rule and verify the server workflow reaches its bot-start log after a clean restart.