# Caso 19: Fukusuke Sushi Delivery

Integrantes: 
- Daniela Aguilar	202111060-7
- Kris Casanga		202021069-1
- Valentina Ibacache 	202173136-9
- Carlos Lavín 		202173087-7
- Gonzalo Severín 	202073088-1

## Requisitos

- Node.js LTS instalado.
- Chart.js instalado

## Como levantar el proyecto

Se necesitan **2 terminales bash abiertas al mismo tiempo** (Git Bash en Windows, o la terminal por defecto en Mac/Linux), cada una parada en la carpeta raiz del repo.

---

### Terminal 1 → Backend

**Paso 1.** Entrar a la carpeta:
```bash
cd backend
```

**Paso 2.** Instalar dependencias:
```bash
npm install
```

**Paso 3.** Crear el archivo de variables de entorno:
```bash
cp .env.example .env
```

**Paso 4.** Inicializar la base de datos:
```bash
npm run db:init
npx prisma generate
```

**Paso 5.** Correr los tests para verificar que todo quedo bien:
```bash
npm run test
```

**Paso 6.** Levantar el servidor:
```bash
npm run dev
```
---

**Para ver los datos en una interfaz visual se puede usar:**
```bash
npm run db:studio
```

---

### Terminal 2 → Frontend

**Paso 1.** Entrar a la carpeta:
```bash
cd frontend
```

**Paso 2.** Instalar dependencias:
```bash
npm install
```

**Paso 3.** Levantar el servidor:
```bash
npm run dev
```

✅ Frontend arriba y consumiendo el backend.

---

## Orden 

1. Levantar primero el **backend** (Terminal 1) hasta que quede corriendo con `npm run dev`.
2. Recien ahi levantar el **frontend** (Terminal 2).