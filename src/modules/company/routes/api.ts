import { createRoute, createRouter, HttpStatusCodes, jsonContent } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { requireRole } from "@/middlewares/role-middleware.js";
import {
  changePassword,
  destroy,
  getProfile,
  index,
  store,
  toggleStatus,
  updateProfile
} from "@/modules/company/controllers/company.controller.js";
import {
  ChangeCompanyPasswordSchema,
  CompanyIdParamsSchema,
  CompanyListResponseSchema,
  CompanyMessageSchema,
  CompanyProfileResponseSchema,
  CompanyResponseSchema,
  CreateCompanyAdminSchema,
  ToggleCompanyStatusSchema,
  UpdateCompanyProfileSchema
} from "@/modules/company/controllers/company.schema.js";

const listRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Company"],
  description: "List all Companies / Company Admins",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CompanyListResponseSchema, "Company list")
  }
});

const createRouteConfig = createRoute({
  path: "/",
  method: "post",
  tags: ["Company"],
  description: "Create a new Company Admin",
  request: {
    body: jsonContent(CreateCompanyAdminSchema, "Create company admin payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(CompanyResponseSchema, "Company created")
  }
});

const toggleStatusRoute = createRoute({
  path: "/{id}/status",
  method: "patch",
  tags: ["Company"],
  description: "Toggle active/inactive status of Company Admin",
  request: {
    params: CompanyIdParamsSchema,
    body: jsonContent(ToggleCompanyStatusSchema, "Status payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CompanyResponseSchema, "Company status updated")
  }
});

const deleteCompanyRoute = createRoute({
  path: "/{id}",
  method: "delete",
  tags: ["Company"],
  description: "Delete Company and all associated data (Super Admin only)",
  request: {
    params: CompanyIdParamsSchema
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CompanyMessageSchema, "Company deleted")
  }
});

const getProfileRoute = createRoute({
  path: "/profile",
  method: "get",
  tags: ["Company"],
  description: "Get logged-in Company profile and settings",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CompanyProfileResponseSchema, "Company profile data")
  }
});

const updateProfileRoute = createRoute({
  path: "/profile",
  method: "put",
  tags: ["Company"],
  description: "Update logged-in Company profile and invoice settings",
  request: {
    body: jsonContent(UpdateCompanyProfileSchema, "Company profile payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CompanyMessageSchema, "Company profile updated")
  }
});

const changePasswordRoute = createRoute({
  path: "/change-password",
  method: "post",
  tags: ["Company"],
  description: "Change password for logged-in Company",
  request: {
    body: jsonContent(ChangeCompanyPasswordSchema, "Password payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CompanyMessageSchema, "Password changed")
  }
});

export default createRouter()
  .group(authMiddleware)
  .api(listRoute, [requireRole("super_admin")], index)
  .api(createRouteConfig, [requireRole("super_admin")], store)
  .api(toggleStatusRoute, [requireRole("super_admin")], toggleStatus)
  .api(deleteCompanyRoute, [requireRole("super_admin")], destroy)
  .api(getProfileRoute, [requireRole("company_admin", "super_admin")], getProfile)
  .api(updateProfileRoute, [requireRole("company_admin", "super_admin")], updateProfile)
  .api(changePasswordRoute, [requireRole("company_admin", "super_admin")], changePassword);
