import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import terminalsRouter from "./terminals";
import routesRouter from "./routes";
import searchRouter from "./search";
import savedRouter from "./saved";
import weatherRouter from "./weather";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(terminalsRouter);
router.use(routesRouter);
router.use(searchRouter);
router.use(savedRouter);
router.use(weatherRouter);

export default router;
