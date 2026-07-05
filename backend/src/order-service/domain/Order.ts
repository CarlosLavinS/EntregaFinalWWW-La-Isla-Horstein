export type OrderStatus = "CREADO" | "PAGADO" | "ANULADO" | "EN_DESPACHO";

export class LineaPedido {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly unitPrice: number
  ) {}

  calculateSubtotal(): number {
    return this.quantity * this.unitPrice;
  }
}

export class Pedido {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly createdAt: string,
    public readonly status: OrderStatus,
    public readonly cancellationReason: string,
    public readonly deliveryAddress: string,
    public readonly distanceKm: number,
    public readonly items: LineaPedido[]
  ) {}

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.calculateSubtotal(), 0);
  }

  confirmPayment(): Pedido {
    if (this.status === "ANULADO") {
      throw new Error("No se puede pagar un pedido anulado.");
    }
    return new Pedido(
      this.id,
      this.customerId,
      this.createdAt,
      "PAGADO",
      this.cancellationReason,
      this.deliveryAddress,
      this.distanceKm,
      this.items
    );
  }

  cancel(reason: string): Pedido {
    if (!reason || reason.trim().length === 0) {
      throw new Error("Debe indicar motivo de anulacion.");
    }
    if (this.status === "PAGADO") {
      throw new Error("No se puede anular un pedido pagado.");
    }
    return new Pedido(
      this.id,
      this.customerId,
      this.createdAt,
      "ANULADO",
      reason,
      this.deliveryAddress,
      this.distanceKm,
      this.items
    );
  }
}

export class Pago {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly externalPlatform: string,
    public readonly transactionToken: string,
    public readonly status: "APROBADO" | "RECHAZADO"
  ) {}
}

export class Venta {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly virtualCashierRole: string,
    public readonly soldAt: string,
    public readonly amount: number
  ) {}
}

export class BoletaDigital {
  constructor(
    public readonly id: string,
    public readonly saleId: string,
    public readonly receiptNumber: string,
    public readonly recipientEmail: string,
    public readonly totalAmount: number,
    public readonly issuedAt: string
  ) {}
}
