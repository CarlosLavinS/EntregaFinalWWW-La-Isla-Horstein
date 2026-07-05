import { Pedido, type Pago, type Venta } from "../domain/Order.js";

export interface OrderPersistenceRepository {
  saveOrder(order: Pedido): Promise<Pedido>;
  findOrderById(id: string): Promise<Pedido | undefined>;
  listOrders(): Promise<Pedido[]>;
  savePayment(payment: Pago): Promise<Pago>;
  saveSale(sale: Venta): Promise<Venta>;
}

export class OrderRepository {
  private readonly orders = new Map<string, Pedido>();
  private readonly payments = new Map<string, Pago>();
  private readonly sales = new Map<string, Venta>();

  async saveOrder(order: Pedido): Promise<Pedido> {
    this.orders.set(order.id, order);
    return order;
  }

  async findOrderById(id: string): Promise<Pedido | undefined> {
    return this.orders.get(id);
  }

  async listOrders(): Promise<Pedido[]> {
    return Array.from(this.orders.values());
  }

  async savePayment(payment: Pago): Promise<Pago> {
    this.payments.set(payment.id, payment);
    return payment;
  }

  async saveSale(sale: Venta): Promise<Venta> {
    this.sales.set(sale.id, sale);
    return sale;
  }
}
