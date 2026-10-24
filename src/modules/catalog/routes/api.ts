import { createRoute, createRouter, HttpStatusCodes, jsonContent } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { requireRole } from "@/middlewares/role-middleware.js";
import {
  createCategory,
  createColor,
  createFabricType,
  createProductType,
  createSize,
  createSizeGroup,
  createSubCategory,
  createUnit,
  getMasterCatalog,
  listCategories,
  listColors,
  listFabricTypes,
  listProductTypes,
  listSizeGroups,
  listSubCategories,
  listUnits,
  listChallanTypes,
  createChallanType,
  updateChallanType,
  toggleChallanTypeStatus,
  listVendorTypes,
  createVendorType,
  updateVendorType,
  toggleVendorTypeStatus,
  listPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethodStatus,
  toggleCategoryStatus,
  toggleColorStatus,
  toggleFabricTypeStatus,
  toggleProductTypeStatus,
  toggleSizeGroupStatus,
  toggleSizeStatus,
  toggleSubCategoryStatus,
  toggleUnitStatus,
  updateCategory,
  updateColor,
  updateProductType,
  updateSize,
  updateSubCategory,
  updateUnit
} from "@/modules/catalog/controllers/catalog.controller.js";
import {
  CategoryListResponseSchema,
  CategoryResponseSchema,
  ColorListResponseSchema,
  ColorResponseSchema,
  CreateCategorySchema,
  CreateColorSchema,
  CreateFabricTypeSchema,
  CreateProductTypeSchema,
  CreateSizeGroupSchema,
  CreateSizeSchema,
  CreateSubCategorySchema,
  CreateUnitSchema,
  EntityIdParamsSchema,
  FabricTypeListResponseSchema,
  FabricTypeResponseSchema,
  GenericMessageResponseSchema,
  MasterCatalogResponseSchema,
  ProductTypeListResponseSchema,
  ProductTypeResponseSchema,
  SizeGroupListResponseSchema,
  SizeGroupResponseSchema,
  SizeResponseSchema,
  SubCategoryListResponseSchema,
  SubCategoryResponseSchema,
  ToggleStatusSchema,
  UnitListResponseSchema,
  UnitResponseSchema,
  UpdateCategorySchema,
  UpdateColorSchema,
  UpdateProductTypeSchema,
  UpdateSizeSchema,
  UpdateSubCategorySchema,
  UpdateUnitSchema,
  CreateChallanTypeSchema,
  UpdateChallanTypeSchema,
  ChallanTypeListResponseSchema,
  ChallanTypeResponseSchema,
  CreateVendorTypeSchema,
  UpdateVendorTypeSchema,
  VendorTypeListResponseSchema,
  VendorTypeResponseSchema,
  CreatePaymentMethodSchema,
  UpdatePaymentMethodSchema,
  PaymentMethodListResponseSchema,
  PaymentMethodResponseSchema
} from "@/modules/catalog/controllers/catalog.schema.js";

// Master Bulk
const masterCatalogRoute = createRoute({
  path: "/master",
  method: "get",
  tags: ["Catalog Master"],
  description: "Get all master catalog settings",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(MasterCatalogResponseSchema, "Master catalog data")
  }
});

// Categories
const listCategoriesRoute = createRoute({
  path: "/categories",
  method: "get",
  tags: ["Catalog - Categories"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CategoryListResponseSchema, "Category list")
  }
});

const createCategoryRoute = createRoute({
  path: "/categories",
  method: "post",
  tags: ["Catalog - Categories"],
  request: {
    body: jsonContent(CreateCategorySchema, "Create category payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(CategoryResponseSchema, "Category created"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const updateCategoryRoute = createRoute({
  path: "/categories/{id}",
  method: "put",
  tags: ["Catalog - Categories"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(UpdateCategorySchema, "Update category payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CategoryResponseSchema, "Category updated"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const toggleCategoryStatusRoute = createRoute({
  path: "/categories/{id}/status",
  method: "patch",
  tags: ["Catalog - Categories"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(ToggleStatusSchema, "Toggle status payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(CategoryResponseSchema, "Category status updated")
  }
});

// Sub Categories
const listSubCategoriesRoute = createRoute({
  path: "/sub-categories",
  method: "get",
  tags: ["Catalog - Sub Categories"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SubCategoryListResponseSchema, "Sub-category list")
  }
});

const createSubCategoryRoute = createRoute({
  path: "/sub-categories",
  method: "post",
  tags: ["Catalog - Sub Categories"],
  request: {
    body: jsonContent(CreateSubCategorySchema, "Create sub-category payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(SubCategoryResponseSchema, "Sub-category created"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const updateSubCategoryRoute = createRoute({
  path: "/sub-categories/{id}",
  method: "put",
  tags: ["Catalog - Sub Categories"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(UpdateSubCategorySchema, "Update sub-category payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SubCategoryResponseSchema, "Sub-category updated"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const toggleSubCategoryStatusRoute = createRoute({
  path: "/sub-categories/{id}/status",
  method: "patch",
  tags: ["Catalog - Sub Categories"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(ToggleStatusSchema, "Toggle status payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SubCategoryResponseSchema, "Sub-category status updated")
  }
});

// Size Groups
const listSizeGroupsRoute = createRoute({
  path: "/size-groups",
  method: "get",
  tags: ["Catalog - Size Groups"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SizeGroupListResponseSchema, "Size group list")
  }
});

const createSizeGroupRoute = createRoute({
  path: "/size-groups",
  method: "post",
  tags: ["Catalog - Size Groups"],
  request: {
    body: jsonContent(CreateSizeGroupSchema, "Create size group payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(SizeGroupResponseSchema, "Size group created"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const toggleSizeGroupStatusRoute = createRoute({
  path: "/size-groups/{id}/status",
  method: "patch",
  tags: ["Catalog - Size Groups"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(ToggleStatusSchema, "Toggle status payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SizeGroupResponseSchema, "Size group status updated")
  }
});

// Sizes
const createSizeRoute = createRoute({
  path: "/sizes",
  method: "post",
  tags: ["Catalog - Sizes"],
  request: {
    body: jsonContent(CreateSizeSchema, "Create size payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(SizeResponseSchema, "Size created")
  }
});

const updateSizeRoute = createRoute({
  path: "/sizes/{id}",
  method: "put",
  tags: ["Catalog - Sizes"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(UpdateSizeSchema, "Update size payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SizeResponseSchema, "Size updated"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const toggleSizeStatusRoute = createRoute({
  path: "/sizes/{id}/status",
  method: "patch",
  tags: ["Catalog - Sizes"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(ToggleStatusSchema, "Toggle status payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SizeResponseSchema, "Size status updated")
  }
});

// Colors
const listColorsRoute = createRoute({
  path: "/colors",
  method: "get",
  tags: ["Catalog - Colors"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ColorListResponseSchema, "Color list")
  }
});

const createColorRoute = createRoute({
  path: "/colors",
  method: "post",
  tags: ["Catalog - Colors"],
  request: {
    body: jsonContent(CreateColorSchema, "Create color payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(ColorResponseSchema, "Color created"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const updateColorRoute = createRoute({
  path: "/colors/{id}",
  method: "put",
  tags: ["Catalog - Colors"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(UpdateColorSchema, "Update color payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ColorResponseSchema, "Color updated"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const toggleColorStatusRoute = createRoute({
  path: "/colors/{id}/status",
  method: "patch",
  tags: ["Catalog - Colors"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(ToggleStatusSchema, "Toggle status payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ColorResponseSchema, "Color status updated")
  }
});

// Fabric Types
const listFabricTypesRoute = createRoute({
  path: "/fabric-types",
  method: "get",
  tags: ["Catalog - Fabric Types"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(FabricTypeListResponseSchema, "Fabric type list")
  }
});

const createFabricTypeRoute = createRoute({
  path: "/fabric-types",
  method: "post",
  tags: ["Catalog - Fabric Types"],
  request: {
    body: jsonContent(CreateFabricTypeSchema, "Create fabric type payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(FabricTypeResponseSchema, "Fabric type created"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const toggleFabricTypeStatusRoute = createRoute({
  path: "/fabric-types/{id}/status",
  method: "patch",
  tags: ["Catalog - Fabric Types"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(ToggleStatusSchema, "Toggle status payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(FabricTypeResponseSchema, "Fabric type status updated")
  }
});

// Product Types ("ধরন" - Category & Sub-Category dependent)
const listProductTypesRoute = createRoute({
  path: "/product-types",
  method: "get",
  tags: ["Catalog - Product Types"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ProductTypeListResponseSchema, "Product type list")
  }
});

const createProductTypeRoute = createRoute({
  path: "/product-types",
  method: "post",
  tags: ["Catalog - Product Types"],
  request: {
    body: jsonContent(CreateProductTypeSchema, "Create product type payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(ProductTypeResponseSchema, "Product type created"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const updateProductTypeRoute = createRoute({
  path: "/product-types/{id}",
  method: "put",
  tags: ["Catalog - Product Types"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(UpdateProductTypeSchema, "Update product type payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ProductTypeResponseSchema, "Product type updated"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const toggleProductTypeStatusRoute = createRoute({
  path: "/product-types/{id}/status",
  method: "patch",
  tags: ["Catalog - Product Types"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(ToggleStatusSchema, "Toggle status payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ProductTypeResponseSchema, "Product type status updated")
  }
});

// Units of Measurement
const listUnitsRoute = createRoute({
  path: "/units",
  method: "get",
  tags: ["Catalog - Units"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(UnitListResponseSchema, "Unit list")
  }
});

const createUnitRoute = createRoute({
  path: "/units",
  method: "post",
  tags: ["Catalog - Units"],
  request: {
    body: jsonContent(CreateUnitSchema, "Create unit payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(UnitResponseSchema, "Unit created"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const updateUnitRoute = createRoute({
  path: "/units/{id}",
  method: "put",
  tags: ["Catalog - Units"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(UpdateUnitSchema, "Update unit payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(UnitResponseSchema, "Unit updated"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(GenericMessageResponseSchema, "Duplicate error")
  }
});

const toggleUnitStatusRoute = createRoute({
  path: "/units/{id}/status",
  method: "patch",
  tags: ["Catalog - Units"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(ToggleStatusSchema, "Toggle status payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(UnitResponseSchema, "Unit status updated")
  }
});

// Challan Types (চালানের ধরন)
const listChallanTypesRoute = createRoute({
  path: "/challan-types",
  method: "get",
  tags: ["Catalog - Challan Types"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ChallanTypeListResponseSchema, "List challan types")
  }
});

const createChallanTypeRoute = createRoute({
  path: "/challan-types",
  method: "post",
  tags: ["Catalog - Challan Types"],
  request: {
    body: jsonContent(CreateChallanTypeSchema, "Create challan type payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(ChallanTypeResponseSchema, "Challan type created")
  }
});

const updateChallanTypeRoute = createRoute({
  path: "/challan-types/{id}",
  method: "put",
  tags: ["Catalog - Challan Types"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(UpdateChallanTypeSchema, "Update challan type payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ChallanTypeResponseSchema, "Challan type updated")
  }
});

const toggleChallanTypeStatusRoute = createRoute({
  path: "/challan-types/{id}/status",
  method: "patch",
  tags: ["Catalog - Challan Types"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(ToggleStatusSchema, "Toggle status payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ChallanTypeResponseSchema, "Challan type status updated")
  }
});

// Vendor Types (সরবরাহকারীর ধরন)
const listVendorTypesRoute = createRoute({
  path: "/vendor-types",
  method: "get",
  tags: ["Catalog - Vendor Types"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(VendorTypeListResponseSchema, "List vendor types")
  }
});

const createVendorTypeRoute = createRoute({
  path: "/vendor-types",
  method: "post",
  tags: ["Catalog - Vendor Types"],
  request: {
    body: jsonContent(CreateVendorTypeSchema, "Create vendor type payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(VendorTypeResponseSchema, "Vendor type created")
  }
});

const updateVendorTypeRoute = createRoute({
  path: "/vendor-types/{id}",
  method: "put",
  tags: ["Catalog - Vendor Types"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(UpdateVendorTypeSchema, "Update vendor type payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(VendorTypeResponseSchema, "Vendor type updated")
  }
});

const toggleVendorTypeStatusRoute = createRoute({
  path: "/vendor-types/{id}/status",
  method: "patch",
  tags: ["Catalog - Vendor Types"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(ToggleStatusSchema, "Toggle status payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(VendorTypeResponseSchema, "Vendor type status updated")
  }
});

// Payment Methods (পরিশোধের মাধ্যম / Trx Type)
const listPaymentMethodsRoute = createRoute({
  path: "/payment-methods",
  method: "get",
  tags: ["Catalog - Payment Methods"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(PaymentMethodListResponseSchema, "List payment methods")
  }
});

const createPaymentMethodRoute = createRoute({
  path: "/payment-methods",
  method: "post",
  tags: ["Catalog - Payment Methods"],
  request: {
    body: jsonContent(CreatePaymentMethodSchema, "Create payment method payload")
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(PaymentMethodResponseSchema, "Payment method created")
  }
});

const updatePaymentMethodRoute = createRoute({
  path: "/payment-methods/{id}",
  method: "put",
  tags: ["Catalog - Payment Methods"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(UpdatePaymentMethodSchema, "Update payment method payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(PaymentMethodResponseSchema, "Payment method updated")
  }
});

const togglePaymentMethodStatusRoute = createRoute({
  path: "/payment-methods/{id}/status",
  method: "patch",
  tags: ["Catalog - Payment Methods"],
  request: {
    params: EntityIdParamsSchema,
    body: jsonContent(ToggleStatusSchema, "Toggle status payload")
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(PaymentMethodResponseSchema, "Payment method status updated")
  }
});

export default createRouter()
  .group(authMiddleware)
  // Master
  .api(masterCatalogRoute, [requireRole("super_admin", "company_admin")], getMasterCatalog)
  // Categories
  .api(listCategoriesRoute, [requireRole("super_admin", "company_admin")], listCategories)
  .api(createCategoryRoute, [requireRole("super_admin")], createCategory)
  .api(updateCategoryRoute, [requireRole("super_admin")], updateCategory)
  .api(toggleCategoryStatusRoute, [requireRole("super_admin")], toggleCategoryStatus)
  // Sub Categories
  .api(listSubCategoriesRoute, [requireRole("super_admin", "company_admin")], listSubCategories)
  .api(createSubCategoryRoute, [requireRole("super_admin")], createSubCategory)
  .api(updateSubCategoryRoute, [requireRole("super_admin")], updateSubCategory)
  .api(toggleSubCategoryStatusRoute, [requireRole("super_admin")], toggleSubCategoryStatus)
  // Size Groups
  .api(listSizeGroupsRoute, [requireRole("super_admin")], listSizeGroups)
  .api(createSizeGroupRoute, [requireRole("super_admin")], createSizeGroup)
  .api(toggleSizeGroupStatusRoute, [requireRole("super_admin")], toggleSizeGroupStatus)
  // Sizes
  .api(createSizeRoute, [requireRole("super_admin")], createSize)
  .api(updateSizeRoute, [requireRole("super_admin")], updateSize)
  .api(toggleSizeStatusRoute, [requireRole("super_admin")], toggleSizeStatus)
  // Colors
  .api(listColorsRoute, [requireRole("super_admin")], listColors)
  .api(createColorRoute, [requireRole("super_admin")], createColor)
  .api(updateColorRoute, [requireRole("super_admin")], updateColor)
  .api(toggleColorStatusRoute, [requireRole("super_admin")], toggleColorStatus)
  // Fabric Types
  .api(listFabricTypesRoute, [requireRole("super_admin")], listFabricTypes)
  .api(createFabricTypeRoute, [requireRole("super_admin")], createFabricType)
  .api(toggleFabricTypeStatusRoute, [requireRole("super_admin")], toggleFabricTypeStatus)
  // Product Types ("ধরন")
  .api(listProductTypesRoute, [requireRole("super_admin")], listProductTypes)
  .api(createProductTypeRoute, [requireRole("super_admin")], createProductType)
  .api(updateProductTypeRoute, [requireRole("super_admin")], updateProductType)
  .api(toggleProductTypeStatusRoute, [requireRole("super_admin")], toggleProductTypeStatus)
  // Units
  .api(listUnitsRoute, [requireRole("super_admin")], listUnits)
  .api(createUnitRoute, [requireRole("super_admin")], createUnit)
  .api(updateUnitRoute, [requireRole("super_admin")], updateUnit)
  .api(toggleUnitStatusRoute, [requireRole("super_admin")], toggleUnitStatus)
  // Challan Types (চালানের ধরন)
  .api(listChallanTypesRoute, [requireRole("super_admin", "company_admin")], listChallanTypes)
  .api(createChallanTypeRoute, [requireRole("super_admin")], createChallanType)
  .api(updateChallanTypeRoute, [requireRole("super_admin")], updateChallanType)
  .api(toggleChallanTypeStatusRoute, [requireRole("super_admin")], toggleChallanTypeStatus)
  // Vendor Types (সরবরাহকারীর ধরন)
  .api(listVendorTypesRoute, [requireRole("super_admin", "company_admin")], listVendorTypes)
  .api(createVendorTypeRoute, [requireRole("super_admin")], createVendorType)
  .api(updateVendorTypeRoute, [requireRole("super_admin")], updateVendorType)
  .api(toggleVendorTypeStatusRoute, [requireRole("super_admin")], toggleVendorTypeStatus)
  // Payment Methods (পরিশোধের মাধ্যম / Trx Type)
  .api(listPaymentMethodsRoute, [requireRole("super_admin", "company_admin")], listPaymentMethods)
  .api(createPaymentMethodRoute, [requireRole("super_admin")], createPaymentMethod)
  .api(updatePaymentMethodRoute, [requireRole("super_admin")], updatePaymentMethod)
  .api(togglePaymentMethodStatusRoute, [requireRole("super_admin")], togglePaymentMethodStatus);

