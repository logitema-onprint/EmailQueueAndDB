import { Router, Express } from "express";
import orderController from "../controllers/orderControllers";
import { testOrderControllers } from "../controllers/orderControllers/test";

const router = Router();

export const orderRoutes = async (server: Express) => {
  server.post("/api/order", orderController.createOrder);
  server.get("/api/order/:orderId", orderController.getOrder);
  server.get("/api/orders", orderController.getAllOrders);
  server.delete("/api/order/:orderId", orderController.deleteOrder);
  server.delete("/api/orders/filter", orderController.deleteManyOrders);

  server.post("/api/order/filter", orderController.getFilteredOrders);
  server.post("/api/orders/tags/filter", orderController.addTagsToOrders);
  server.post("/api/orders/remove/tags", orderController.removeTagsFromOrders);
  server.post(
    "/api/orders/pause/tags",
    orderController.pauseTagsToFilteredOrders
  );
  server.post(
    "/api/orders/resume/tags",
    orderController.resumeTagsToFilteredOrders
  );

  server.post("/api/order/test", testOrderControllers.createMassOrders);

  server.post("/api/orders/pause", orderController.pauseManyOrders);
  server.post("/api/orders/resume", orderController.resumeManyOrders);
  server.post("/api/orders/inactive", orderController.inactiveManyOrders);

  server.post("/api/orders/selected/tscope/create", orderController.addTags);
  server.post("/api/orders/selected/tscope/remove", orderController.removeTags);
  server.post("/api/orders/selected/tscope/pause", orderController.pauseTags);
  server.post("/api/orders/selected/tscope/resume", orderController.resumeTags);
  server.post("/api/orders/selected/tscope/inactive", orderController.inactiveTags);


  server.post('/api/orders/selected/dscope/delete', orderController.deleteSelectedOrders)
};



export default router;
