from pathlib import Path
import sqlite3

db_path = Path(__file__).resolve().parents[1] / "prisma" / "dev.db"
db_path.parent.mkdir(parents=True, exist_ok=True)

connection = sqlite3.connect(db_path)
connection.execute("PRAGMA foreign_keys = ON")

connection.executescript(
    """
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT NOT NULL,
      "profile" TEXT NOT NULL,
      "run" TEXT,
      "fullName" TEXT,
      "address" TEXT,
      "commune" TEXT,
      "province" TEXT,
      "region" TEXT,
      "birthDate" TEXT,
      "sex" TEXT,
      "phone" TEXT,
      "emailValidated" BOOLEAN NOT NULL DEFAULT false,
      "employeeRun" TEXT,
      "position" TEXT
    );

    CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "price" REAL NOT NULL,
      "imageUrl" TEXT NOT NULL,
      "available" BOOLEAN NOT NULL DEFAULT true,
      "categoryId" TEXT NOT NULL,
      CONSTRAINT "Product_categoryId_fkey"
        FOREIGN KEY ("categoryId") REFERENCES "Category" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "customerId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL,
      "status" TEXT NOT NULL,
      "cancellationReason" TEXT NOT NULL,
      "deliveryAddress" TEXT NOT NULL,
      "distanceKm" REAL NOT NULL,
      CONSTRAINT "Order_customerId_fkey"
        FOREIGN KEY ("customerId") REFERENCES "User" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "OrderItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "unitPrice" REAL NOT NULL,
      CONSTRAINT "OrderItem_orderId_fkey"
        FOREIGN KEY ("orderId") REFERENCES "Order" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "Payment" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "externalPlatform" TEXT NOT NULL,
      "transactionToken" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      CONSTRAINT "Payment_orderId_fkey"
        FOREIGN KEY ("orderId") REFERENCES "Order" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "Sale" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "virtualCashierRole" TEXT NOT NULL,
      "soldAt" DATETIME NOT NULL,
      "amount" REAL NOT NULL,
      CONSTRAINT "Sale_orderId_fkey"
        FOREIGN KEY ("orderId") REFERENCES "Order" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    );
    """
)

connection.commit()
connection.close()

print(f"SQLite database ready at {db_path}")
