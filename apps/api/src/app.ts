import "express-async-errors";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./lib/errors.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { checkInRouter } from "./modules/check-ins/check-in.routes.js";
import { coupleSpaceRouter } from "./modules/couple-spaces/couple-space.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { expectationRouter } from "./modules/expectations/expectation.routes.js";
import { expectationSetRouter } from "./modules/expectation-sets/expectation-set.routes.js";
import { reviewRouter } from "./modules/reviews/review.routes.js";
import { env } from "./lib/env.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "expectations-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/couple-spaces", coupleSpaceRouter);
app.use("/api/expectation-sets", expectationSetRouter);
app.use("/api/expectations", expectationRouter);
app.use("/api/check-ins", checkInRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reviews", reviewRouter);

app.use(errorHandler);
