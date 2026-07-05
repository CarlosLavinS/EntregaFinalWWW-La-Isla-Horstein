import { describe, expect, it } from "vitest";
import { OrderRepository } from "../src/order-service/repositories/OrderRepository.js";
import { OrderService } from "../src/order-service/services/OrderService.js";

const catalogClient = {
  getProduct: async (id: string) => ({
    id,
    name: "Avocado roll",
    price: 6900,
    available: true
  })
};

describe("OrderService", () => {
  it("crea un pedido calculando total con precios del catalogo", async () => {
    const service = new OrderService(new OrderRepository(), catalogClient);

    const order = await service.createOrder({
      customerId: "cliente-1",
      deliveryAddress: "Maipu 123",
      distanceKm: 2.4,
      items: [{ productId: "producto-1", quantity: 2 }]
    });

    expect(order.total).toBe(13800);
    expect(order.items[0].subtotal).toBe(13800);
  });

  it("rechaza despachos fuera del radio de 3 kilometros", async () => {
    const service = new OrderService(new OrderRepository(), catalogClient);

    await expect(
      service.createOrder({
        customerId: "cliente-1",
        deliveryAddress: "Muy lejos",
        distanceKm: 3.5,
        items: [{ productId: "producto-1", quantity: 1 }]
      })
    ).rejects.toThrow("3 km");
  });

  it("confirma pago y lo incluye en el reporte de ventas", async () => {
    const service = new OrderService(new OrderRepository(), catalogClient);
    const order = await service.createOrder({
      customerId: "cliente-1",
      deliveryAddress: "Maipu 123",
      distanceKm: 1,
      items: [{ productId: "producto-1", quantity: 1 }]
    });

    const payment = await service.confirmPayment(order.id, "Servipag", "tx-123");
    const report = await service.getSalesReport("2020-01-01", "2999-12-31");

    expect(payment.status).toBe("APROBADO");
    expect(report.totalSales).toBe(1);
    expect(report.totalAmount).toBe(6900);
  });
});
