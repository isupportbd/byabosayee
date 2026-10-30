import { createRouter } from "@/framework/facade.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import {
  createBrand,
  updateBrand,
  deleteBrand,
  listBrands,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  listSuppliers,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
  listManufacturers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listCustomers,
  createItem,
  updateItem,
  deleteItem,
  listItems,
  getStats,
  listPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getMediaConfig,
  uploadMediaImage,
  updatePurchaseAttachments,
  listItemPricings,
  saveItemPricing,
  deleteItemPricing,
  listSales,
  getSaleById,
  createSale,
  deleteSale
} from "@/modules/inventory/controllers/inventory.controller.js";

const router = createRouter();

router.use("*", authMiddleware);

// Stats
router.get("/stats", getStats);

// Brands
router.get("/brands", listBrands);
router.post("/brands", createBrand);
router.put("/brands/:id", updateBrand);
router.delete("/brands/:id", deleteBrand);

// Suppliers
router.get("/suppliers", listSuppliers);
router.post("/suppliers", createSupplier);
router.put("/suppliers/:id", updateSupplier);
router.delete("/suppliers/:id", deleteSupplier);

// Manufacturers
router.get("/manufacturers", listManufacturers);
router.post("/manufacturers", createManufacturer);
router.put("/manufacturers/:id", updateManufacturer);
router.delete("/manufacturers/:id", deleteManufacturer);

// Customers
router.get("/customers", listCustomers);
router.post("/customers", createCustomer);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

// Items
router.get("/items", listItems);
router.post("/items", createItem);
router.put("/items/:id", updateItem);
router.delete("/items/:id", deleteItem);

// Purchases
router.get("/purchases", listPurchases);
router.post("/purchases", createPurchase);
router.put("/purchases/:id", updatePurchase);
router.delete("/purchases/:id", deletePurchase);
router.put("/purchases/:id/attachments", updatePurchaseAttachments);

// Media Upload & Config
router.get("/media-config", getMediaConfig);
router.post("/upload-image", uploadMediaImage);

// Pricings (মূল্য নির্ধারণ)
router.get("/pricings", listItemPricings);
router.post("/pricings", saveItemPricing);
router.put("/pricings/:id", saveItemPricing);
router.delete("/pricings/:id", deleteItemPricing);

// Sales (পণ্য বিক্রয় ও পিওএস)
router.get("/sales", listSales);
router.get("/sales/:id", getSaleById);
router.post("/sales", createSale);
router.delete("/sales/:id", deleteSale);

export default router;
