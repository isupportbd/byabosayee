import { createRouter } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import {
  createCapital,
  createWithdrawal,
  deleteCapital,
  deleteWithdrawal,
  getAccountsSummary,
  getCapitalById,
  getCapitals,
  getShareholders,
  getWithdrawalById,
  getWithdrawals,
  updateCapital,
  updateWithdrawal
} from "@/modules/accounts/controllers/accounts.controller.js";

const router = createRouter();

router.use("*", authMiddleware);

// Accounts Summary & Shareholders
router.get("/summary", getAccountsSummary);
router.get("/shareholders", getShareholders);

// Capital Investments (মূলধন / পুঁজি যোগ)
router.get("/capitals", getCapitals);
router.get("/capitals/:id", getCapitalById);
router.post("/capitals", createCapital);
router.put("/capitals/:id", updateCapital);
router.delete("/capitals/:id", deleteCapital);

// Capital Withdrawals (মূলধন / লাভ উত্তোলন)
router.get("/withdrawals", getWithdrawals);
router.get("/withdrawals/:id", getWithdrawalById);
router.post("/withdrawals", createWithdrawal);
router.put("/withdrawals/:id", updateWithdrawal);
router.delete("/withdrawals/:id", deleteWithdrawal);

export default router;
