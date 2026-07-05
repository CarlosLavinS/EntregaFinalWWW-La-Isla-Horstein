# Fukusuke Sushi Delivery - Backend

Backend academico para el Caso 19. La solución usa microservicios con REST publico, gRPC interno y un API Gateway GraphQL como agregador.

## Tecnologias elegidas

- Node.js + TypeScript: permite programacion orientada a objetos, tipos estaticos y una curva de instalacion simple en VS Code.
- Express: expone endpoints REST simples por microservicio.
- Apollo Server + GraphQL: actua como API Gateway y agrega datos de usuarios, catalogo y pedidos.
- @grpc/grpc-js: define contratos internos entre microservicios mediante `proto/fukusuke.proto`.
- SQLite + Prisma: guarda datos persistentes en `prisma/dev.db` sin instalar un servidor de base de datos.
- Vitest: prueba la capa de servicios sin depender del frontend.

## Arquitectura

```txt
Postman / GraphQL Sandbox
        |
        v
api-gateway GraphQL :4000
        |
        | gRPC interno
        +--> user-service    REST :3001 / gRPC :50051
        +--> catalog-service REST :3002 / gRPC :50052
        +--> order-service   REST :3003 / gRPC :50053
                              |
                              +--> consulta catalog-service por gRPC
```

## Microservicios

- `user-service`: registro de clientes, autenticacion y validacion simulada de correo.
- `catalog-service`: categorias, productos y disponibilidad.
- `order-service`: pedidos, lineas de pedido, anulacion, pago y reporte de ventas.
- `api-gateway`: consultas y mutaciones GraphQL; agrega datos cuando el frontend necesita multiples dominios.

## Como instalar

Se necesita instalado:

- Node.js LTS.
- Python 3, solo para ejecutar el script local que crea `prisma/dev.db`.
- VS Code.
- Postman, Insomnia o el Sandbox de Apollo en `http://localhost:4000`.

Ejecutar:

```bash
npm install
cp .env.example .env
npm run db:init
npx prisma generate
npm run test
npm run dev
```

En Windows PowerShell, si no se tiene `cp`, usar:

```powershell
Copy-Item .env.example .env
```

En este proyecto ya existe un `.env` local creado para desarrollo, pero el comando anterior sirve si lo borras o clonas el repositorio en otro computador.

La base SQLite queda en:

```txt
prisma/dev.db
```

Para ver los datos en una interfaz visual se puede usar:

```bash
npm run db:studio
```

## Endpoints

- GraphQL Gateway: `http://localhost:4000`
- User REST: `http://localhost:3001`
- Catalog REST: `http://localhost:3002`
- Order REST: `http://localhost:3003`

## Ejemplos usados en esta entrega (GraphQL)

Crear cliente:

```graphql
mutation {
  createCustomer(input: {
    run: "11111111-1"
    fullName: "Cliente Demo"
    address: "Av. Pajaritos 123"
    commune: "Maipu"
    province: "Santiago"
    region: "Metropolitana"
    birthDate: "1998-01-10"
    sex: "F"
    email: "cliente@demo.cl"
    phone: "+56911111111"
    password: "secreta"
  }) {
    id
    fullName
    emailValidated
  }
}
```

Listar productos semilla:

```graphql
query {
  products {
    id
    name
    price
    available
  }
}
```

Crear pedido:

```graphql
mutation CrearPedido($customerId: ID!, $productId: ID!) {
  createOrder(input: {
    customerId: $customerId
    deliveryAddress: "Av. Pajaritos 123"
    distanceKm: 2.1
    items: [{ productId: $productId, quantity: 2 }]
  }) {
    id
    status
    total
  }
}
```

Confirmar pago:

```graphql
mutation ConfirmarPago($orderId: ID!) {
  confirmPayment(orderId: $orderId, externalPlatform: "Servipag", transactionToken: "tx-demo-001") {
    id
    status
  }
}
```

Reporte:

```graphql
query {
  salesReport(from: "2020-01-01", to: "2999-12-31") {
    totalSales
    totalAmount
  }
}
```

## Pruebas

Las pruebas verifican la capa `services`:

```bash
npm run test
```

