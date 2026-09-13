import { Router, type IRouter } from "express";
import { handleTelegramUpdate } from "../bot";

const router: IRouter = Router();

router.post("/telegram/webhook", async (req, res, next) => {
  try {
    await handleTelegramUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

export default router;