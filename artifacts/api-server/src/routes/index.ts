import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import moodRouter from "./mood";
import userRouter from "./user";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(moodRouter);
router.use(userRouter);

export default router;
