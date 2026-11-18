import { createRouter } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import {
  getPartiesReport,
  getProfitLossReport,
  getStatementReport,
  getStockReport,
  getSummaryReport
} from "@/modules/reports/controllers/reports.controller.js";

const router = createRouter();

router.use("*", authMiddleware);

router.get("/summary", getSummaryReport);
router.get("/stock", getStockReport);
router.get("/statement", getStatementReport);
router.get("/profit-loss", getProfitLossReport);
router.get("/parties", getPartiesReport);

export default router;
