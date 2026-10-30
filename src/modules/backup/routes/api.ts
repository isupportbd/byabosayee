import { createRoute, createRouter, HttpStatusCodes, jsonContent, z } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { requireRole } from "@/middlewares/role-middleware.js";
import { downloadBackup, getDatabaseStats, restoreBackup } from "../controllers/backup.controller.js";

const getStatsRoute = createRoute({
  path: "/stats",
  method: "get",
  tags: ["Backup & Storage"],
  description: "Get real database size and table stats",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Database stats")
  }
});

const downloadBackupRoute = createRoute({
  path: "/download",
  method: "get",
  tags: ["Backup & Storage"],
  description: "Download full database backup JSON",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Backup JSON file")
  }
});

const restoreBackupRoute = createRoute({
  path: "/restore",
  method: "post",
  tags: ["Backup & Storage"],
  description: "Restore backup JSON (Superadmin excluded)",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.any(), "Restore success")
  }
});

export default createRouter()
  .group(authMiddleware)
  .api(getStatsRoute, [requireRole("super_admin")], getDatabaseStats)
  .api(downloadBackupRoute, [requireRole("super_admin")], downloadBackup)
  .api(restoreBackupRoute, [requireRole("super_admin")], restoreBackup);
