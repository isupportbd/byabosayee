import { createRoute, createRouter, HttpStatusCodes, jsonContent, z } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { requireRole } from "@/middlewares/role-middleware.js";
import { getPublicSettings, listSettings, saveSetting } from "../controllers/settings.controller.js";
import { SaveSettingSchema, SettingItemSchema } from "../controllers/settings.schema.js";

const publicSettingsRoute = createRoute({
  path: "/public",
  method: "get",
  tags: ["Settings"],
  description: "Get public settings (e.g. font)",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ data: z.array(SettingItemSchema) }),
      "Public settings"
    )
  }
});

const listSettingsRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Settings"],
  description: "Get all settings for super admin",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ data: z.array(SettingItemSchema) }),
      "Settings list"
    )
  }
});

const saveSettingRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Settings"],
  description: "Save setting",
  request: {
    body: jsonContent(SaveSettingSchema, "Setting payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ message: z.string(), data: SettingItemSchema.optional() }),
      "Setting saved"
    ),
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({ message: z.string(), data: SettingItemSchema.optional() }),
      "Setting created"
    )
  }
});

export default createRouter()
  .api(publicSettingsRoute, [], getPublicSettings)
  .use(authMiddleware)
  .api(listSettingsRoute, [requireRole("super_admin")], listSettings)
  .api(saveSettingRoute, [requireRole("super_admin")], saveSetting);
