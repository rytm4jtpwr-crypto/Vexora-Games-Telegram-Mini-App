import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const sendHealth = (_req: Parameters<Parameters<IRouter["get"]>[1]>[0], res: Parameters<Parameters<IRouter["get"]>[1]>[1]) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
};

router.get("/", sendHealth);
router.get("/healthz", sendHealth);

export default router;
