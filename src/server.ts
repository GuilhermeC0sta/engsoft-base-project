import cors from "cors";
import express from "express";
import helmet from "helmet";
import "dotenv/config";
import { errorHandler } from "./errorHandler";
import { AppError } from "./errors";
import { logger } from "./logger";
import { requestLogger } from "./requestLogger";
import router from "./routes";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use("/api", router);

app.use((_request, _response, next) => {
  next(new AppError(404, "Rota nao encontrada"));
});

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Oxetech Helpdesk API running on http://localhost:${port}`);
});
