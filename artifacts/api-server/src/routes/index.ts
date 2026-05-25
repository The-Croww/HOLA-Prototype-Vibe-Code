import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import moodRouter from "./mood";
import userRouter from "./user";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(moodRouter);
router.use(userRouter);
router.use(chatRouter);

export default router;
