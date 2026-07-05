# Decisiones arquitectonicas

## 1. Division de microservicios

Decision arquitectonica: separar en `user-service`, `catalog-service` y `order-service`.

Alternativa A: crear un unico backend monolitico.

Descarte: se descarta porque mezcla usuarios, catalogo, pedidos y ventas en una sola unidad, reduciendo cohesion y dificultando justificar limites de microservicios.

Alternativa B: separar por entidades del diagrama de clases.

Descarte: se descarta porque produciria demasiados servicios pequenos, por ejemplo `boleta-service`, `pago-service` y `chofer-service`, aumentando complejidad y acoplamiento para una entrega academica.

Alternativa C: separar por dominios de negocio.

Seleccion: se selecciona la alternativa C.

Justificacion: usuarios, catalogo y pedidos/ventas son dominios claros del caso. Esta division mantiene alta cohesion interna y permite bajo acoplamiento mediante contratos gRPC.

## 2. GraphQL como API Gateway

Decision arquitectonica: usar GraphQL en `api-gateway`.

Alternativa A: que el frontend consuma directamente cada REST de cada microservicio.

Descarte: se descarta porque obliga al cliente a conocer multiples servicios y aumenta acoplamiento con la estructura interna.

Alternativa B: usar GraphQL como agregador.

Seleccion: se selecciona la alternativa B.

Justificacion: GraphQL permite resolver vistas que mezclan datos, por ejemplo pedido + cliente + productos, sin que el frontend llame tres APIs diferentes. El gateway queda como punto de entrada y los microservicios conservan su independencia.

## 3. gRPC para comunicacion interna

Decision arquitectonica: usar gRPC entre servicios.

Alternativa A: comunicacion interna por REST.

Descarte: se descarta porque REST interno no define contratos tan explicitos como un `.proto` y puede generar acoplamiento por convenciones informales.

Alternativa B: comunicacion interna por gRPC.

Seleccion: se selecciona la alternativa B.

Justificacion: gRPC permite contratos claros, mensajes tipados y una separacion fuerte entre implementacion interna y comunicacion. `order-service` consulta `catalog-service` por gRPC para obtener precio y disponibilidad, sin importar clases internas del catalogo.

## 4. Persistencia

Decision arquitectonica: usar SQLite + Prisma para persistencia local.

Alternativa A: PostgreSQL desde el inicio.

Descarte: se descarta para esta etapa porque obliga a instalar y configurar un servicio externo, puertos, usuarios y credenciales. Para una entrega centrada en arquitectura y servicios verificables, ese riesgo operacional no aporta al objetivo principal.

Alternativa B: repositorios en memoria con interfaz clara.

Descarte: se descarta como solucion final porque permite probar la logica, pero los datos se pierden al cerrar el servidor.

Alternativa C: SQLite + Prisma.

Seleccion: se selecciona la alternativa C.

Justificacion: SQLite permite persistencia real sin instalar un servidor de base de datos. Prisma entrega modelos claros y repositorios mantenibles. La capa repository mantiene separada la logica de negocio del almacenamiento, por lo que migrar a PostgreSQL afecta principalmente a repositorios/configuracion, no a services, GraphQL ni contratos gRPC.

## 5. Relaciones del dominio

Decision arquitectonica: representar herencia, composicion y asociacion en codigo.

Alternativa A: modelar todo como objetos planos.

Descarte: se descarta porque no refleja bien el diagrama de clases ni permite explicar relaciones.

Alternativa B: usar clases de dominio.

Seleccion: se selecciona la alternativa B.

Justificacion: `Cliente` y `Administrador` heredan de `Usuario`; `Pedido` compone muchas `LineaPedido`; `Producto` se asocia a `Categoria`; `Pago` y `Venta` quedan asociados al pedido. Esto ayuda a justificar composicion, herencia y bajo acoplamiento.
