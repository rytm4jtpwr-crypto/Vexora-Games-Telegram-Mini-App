---
name: NFT animation backgrounds
description: How to prepare user-provided Telegram Gift screen recordings for prize cards.
---

Remove the original background from every animation frame with foreground segmentation, then encode the frames as an alpha-enabled WebM and create a transparent PNG poster.

**Why:** Telegram Gift recordings contain gradients and repeating patterns. Chroma/color key filtering leaves those backgrounds visible and does not produce a clean isolated gift.

**How to apply:** Use this process for every new batch of recorded NFT gifts before placing the animation over Vexora's own card gradients.