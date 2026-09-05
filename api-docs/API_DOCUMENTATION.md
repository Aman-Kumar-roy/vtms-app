# Vasudha Polymer VTMS — REST API Documentation

Complete REST API specification, data models, payloads, server receipt formats, and client integration guide for the **Vasudha Polymer Vendor & Transaction Management System (VTMS)**.

---

## 📌 1. Server Endpoints & Base URLs

| Environment | Base URL | Description |
| :--- | :--- | :--- |
| **Local Development (Web / Desktop)** | `http://localhost:5000/api/v1` | Primary local development backend |
| **Local Wi-Fi (Physical Mobile / Emulator)** | `http://<METRO_HOST_IP>:5000/api/v1` | Auto-resolved dynamically in `app/src/api/client.ts` via Metro host IP |
| **Production Server** | `https://api.vasudhapolymer.com/api/v1` | Production deployment URL |

---

## 🔐 2. Authentication & Authorization

All protected endpoints require a JWT Bearer token in the `Authorization` header:

```http
Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json
Accept: application/json
```

### Credentials & Roles
* **Administrator**: `admin@vasudhapolymer.com` / `Admin@123` (Fallback: `admin@webkul.com` / `admin123`)
  - Full read, create, update, and delete permissions across all resources.
* **Operations Manager**: `manager@vasudhapolymer.com` / `Manager@123`
  - Read access and operational create permissions (create sellers, create deliveries, record payments, view reports). Modification and deletion of historical records are restricted to administrators.

---

## 📋 3. Business Domain Rules (AGENTS.md Compliant)

> [!IMPORTANT]
> **Strict Tank Capacities**:
> We sell polymer water storage tank units to vendors/sellers. Only **`500L` (`tank500`)**, **`1000L` (`tank1000`)**, and **`2000L` (`tank2000`)** are allowed in the system. Never add or send other tank sizes (`300L`, `750L`, `1500L`, etc.).

> [!IMPORTANT]
> **Dynamic Ledger Totals**:
> `totalDeliveries`, `totalPaid`, and `totalDues` are calculated dynamically on the server from the `Transaction` collection. Clients must NEVER calculate, store, or hardcode balance amounts.

> [!IMPORTANT]
> **Vendor Toggle Logic (`requireAdditional`)**:
> - **When `true` (Default)**: Vendor Name, Email Address (valid format), and GSTIN (15 alphanumeric characters) are mandatory. Phone and Address are optional.
> - **When `false`**: Only Vendor Name is mandatory. Email, GSTIN, Phone, and Address are optional.

> [!IMPORTANT]
> **Server-Generated Official Receipts**:
> Both `POST /api/v1/transactions` and `GET /api/v1/transactions/:id/receipt` return the server's official receipt voucher object (`RCP-XXXXXXXX`) containing company credentials from `.env`, vendor details, itemized tank breakdown, and digital verification seal.

---

## 🚀 4. REST API Endpoints

### 4.1 Authentication & Users (`/api/v1/auth`)

#### 1. Login
* **Method**: `POST`
* **Route**: `/api/v1/auth/login`
* **Auth**: None

**Request Body**:
```json
{
  "email": "admin@vasudhapolymer.com",
  "password": "Admin@123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "66d82345e12a4b001a333333",
      "email": "admin@vasudhapolymer.com",
      "name": "System Administrator",
      "role": "admin"
    }
  }
}
```

---

#### 2. Get Current Authenticated User
* **Method**: `GET`
* **Route**: `/api/v1/auth/me`
* **Auth**: Bearer Token

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "66d82345e12a4b001a333333",
      "email": "admin@vasudhapolymer.com",
      "name": "System Administrator",
      "role": "admin"
    }
  }
}
```

---

#### 3. List Users (Admin Only)
* **Method**: `GET`
* **Route**: `/api/v1/auth/users`
* **Auth**: Bearer Token (Admin)

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "66d82345e12a4b001a333333",
        "name": "System Administrator",
        "email": "admin@vasudhapolymer.com",
        "role": "admin",
        "createdAt": "2026-09-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### 4. Create User (Admin Only)
* **Method**: `POST`
* **Route**: `/api/v1/auth/users`
* **Auth**: Bearer Token (Admin)

**Request Body**:
```json
{
  "name": "Operations Manager",
  "email": "manager@vasudhapolymer.com",
  "password": "Manager@123",
  "role": "manager"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User created successfully.",
  "data": {
    "user": {
      "id": "66d82345e12a4b001a444444",
      "email": "manager@vasudhapolymer.com",
      "name": "Operations Manager",
      "role": "manager"
    }
  }
}
```

---

#### 5. Delete User (Admin Only)
* **Method**: `DELETE`
* **Route**: `/api/v1/auth/users/:id`
* **Auth**: Bearer Token (Admin)

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User deleted successfully."
}
```

---

### 4.2 Sellers / Vendors (`/api/v1/sellers`)

#### 1. Get All Sellers (Paginated with Dynamic Server Totals)
* **Method**: `GET`
* **Route**: `/api/v1/sellers`
* **Query Parameters**:
  - `page` (number, default: `1`)
  - `limit` (number, default: `10`)
  - `search` (string, optional - filters name, phone, email, GSTIN)

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "sellers": [
      {
        "_id": "66d82345e12a4b001a111111",
        "name": "Apex Polymer Solutions",
        "email": "contact@apexpolymer.com",
        "phone": "+91 98765 43210",
        "address": "Plot 42, Industrial Zone, New Delhi",
        "gstNumber": "07AAAAA0000A1Z5",
        "totalDeliveries": 125000.00,
        "totalPaid": 95000.00,
        "totalDues": 30000.00,
        "tank500": 45,
        "tank1000": 20,
        "tank2000": 8,
        "createdAt": "2026-09-01T08:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 18,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
}
```

---

#### 2. Create Seller
* **Method**: `POST`
* **Route**: `/api/v1/sellers`
* **Auth**: Bearer Token (Admin or Manager)

**Request Body (Strict Mode - `requireAdditional: true`)**:
```json
{
  "name": "Apex Polymer Solutions",
  "email": "contact@apexpolymer.com",
  "phone": "+91 98765 43210",
  "address": "Plot 42, Industrial Area, Sector 58, Faridabad",
  "gstNumber": "07AAAAA0000A1Z5",
  "requireAdditional": true
}
```

**Request Body (Quick Mode - `requireAdditional: false`)**:
```json
{
  "name": "Local Vendor Enterprise",
  "phone": "+91 99999 11111",
  "requireAdditional": false
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Seller created successfully.",
  "seller": {
    "_id": "66d82345e12a4b001a111111",
    "name": "Apex Polymer Solutions",
    "email": "contact@apexpolymer.com",
    "phone": "+91 98765 43210",
    "address": "Plot 42, Industrial Area, Sector 58, Faridabad",
    "gstNumber": "07AAAAA0000A1Z5",
    "totalDeliveries": 0,
    "totalPaid": 0,
    "totalDues": 0,
    "tank500": 0,
    "tank1000": 0,
    "tank2000": 0,
    "createdAt": "2026-09-05T12:00:00.000Z"
  },
  "data": {
    "_id": "66d82345e12a4b001a111111",
    "name": "Apex Polymer Solutions",
    "email": "contact@apexpolymer.com",
    "phone": "+91 98765 43210",
    "address": "Plot 42, Industrial Area, Sector 58, Faridabad",
    "gstNumber": "07AAAAA0000A1Z5",
    "totalDeliveries": 0,
    "totalPaid": 0,
    "totalDues": 0,
    "tank500": 0,
    "tank1000": 0,
    "tank2000": 0,
    "createdAt": "2026-09-05T12:00:00.000Z"
  }
}
```

---

#### 3. Get Seller by ID (Details, Computed Stats & History)
* **Method**: `GET`
* **Route**: `/api/v1/sellers/:id`
* **Query Parameters**:
  - `page` (number, default: `1`)
  - `limit` (number, default: `10`)

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "seller": {
      "_id": "66d82345e12a4b001a111111",
      "name": "Apex Polymer Solutions",
      "email": "contact@apexpolymer.com",
      "phone": "+91 98765 43210",
      "address": "Plot 42, Industrial Zone, New Delhi",
      "gstNumber": "07AAAAA0000A1Z5",
      "totalDeliveries": 125000.00,
      "totalPaid": 95000.00,
      "totalDues": 30000.00,
      "tank500": 45,
      "tank1000": 20,
      "tank2000": 8
    },
    "transactions": [
      {
        "_id": "66d82345e12a4b001a222222",
        "sellerId": "66d82345e12a4b001a111111",
        "type": "DELIVERY",
        "amount": 25000.00,
        "date": "2026-09-04T10:00:00.000Z",
        "note": "Standard dispatch",
        "tank500": 10,
        "tank1000": 5,
        "tank2000": 2
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

#### 4. Update Seller (Admin Only)
* **Method**: `PUT`
* **Route**: `/api/v1/sellers/:id`
* **Auth**: Bearer Token (Admin)

**Request Body**:
```json
{
  "name": "Apex Polymer Solutions Pvt Ltd",
  "email": "info@apexpolymer.com",
  "phone": "+91 98765 43210",
  "address": "Plot 42-B, Industrial Zone, New Delhi",
  "gstNumber": "07AAAAA0000A1Z5"
}
```

---

#### 5. Delete Seller (Admin Only)
* **Method**: `DELETE`
* **Route**: `/api/v1/sellers/:id`
* **Auth**: Bearer Token (Admin)

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Seller deleted successfully."
}
```

---

### 4.3 Transactions & Receipts (`/api/v1/transactions`)

#### 1. Get All Transactions
* **Method**: `GET`
* **Route**: `/api/v1/transactions`
* **Query Parameters**:
  - `page` (number, default: `1`)
  - `limit` (number, default: `10`)
  - `type` (`DELIVERY` | `PAYMENT`, optional)
  - `sellerId` (MongoDB ObjectId, optional)
  - `search` (string, optional - searches notes, seller name, payment mode)

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "66d82345e12a4b001a222222",
        "sellerId": {
          "_id": "66d82345e12a4b001a111111",
          "name": "Apex Polymer Solutions",
          "email": "contact@apexpolymer.com",
          "phone": "+91 98765 43210"
        },
        "type": "DELIVERY",
        "amount": 38500.50,
        "date": "2026-09-05T12:00:00.000Z",
        "note": "Dispatched polymer tanks",
        "tank500": 10,
        "tank1000": 5,
        "tank2000": 2,
        "createdAt": "2026-09-05T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 35,
      "page": 1,
      "limit": 10,
      "pages": 4
    }
  }
}
```

---

#### 2. Create Transaction (Delivery or Payment)
* **Method**: `POST`
* **Route**: `/api/v1/transactions`
* **Auth**: Bearer Token (Admin or Manager)

**Delivery Request Body (Strict 500L, 1000L, 2000L tanks)**:
```json
{
  "sellerId": "66d82345e12a4b001a111111",
  "type": "DELIVERY",
  "amount": 38500.50,
  "date": "2026-09-05T12:00:00.000Z",
  "note": "Dispatched standard polymer water storage tanks batch #101",
  "tank500": 10,
  "tank1000": 5,
  "tank2000": 2
}
```

**Payment Request Body**:
```json
{
  "sellerId": "66d82345e12a4b001a111111",
  "type": "PAYMENT",
  "amount": 25000.00,
  "date": "2026-09-05T14:30:00.000Z",
  "paymentMode": "UPI",
  "note": "Settlement for batch #101 via corporate UPI",
  "parentId": null
}
```

**Response (201 Created with Server-Generated Receipt)**:
```json
{
  "success": true,
  "message": "Transaction created successfully.",
  "transaction": {
    "_id": "66d82345e12a4b001a222222",
    "sellerId": "66d82345e12a4b001a111111",
    "type": "DELIVERY",
    "amount": 38500.50,
    "date": "2026-09-05T12:00:00.000Z",
    "note": "Dispatched standard polymer water storage tanks batch #101",
    "tank500": 10,
    "tank1000": 5,
    "tank2000": 2,
    "createdAt": "2026-09-05T12:00:00.000Z"
  },
  "receipt": {
    "receiptNumber": "RCP-20260905-1049",
    "transactionId": "66d82345e12a4b001a222222",
    "issueDate": "2026-09-05T12:00:00.000Z",
    "type": "DELIVERY",
    "amount": 38500.50,
    "paymentMode": "CASH",
    "note": "Dispatched standard polymer water storage tanks batch #101",
    "company": {
      "name": "Vasudha Polymer",
      "gstNumber": "07AAAAA0000A1Z5",
      "phone": "+91 98765 43210",
      "address": "Plot 42, Industrial Zone, New Delhi - 110020"
    },
    "seller": {
      "_id": "66d82345e12a4b001a111111",
      "name": "Apex Polymer Solutions",
      "email": "contact@apexpolymer.com",
      "phone": "+91 98765 43210",
      "gstNumber": "07AAAAA0000A1Z5"
    },
    "items": [
      { "item": "Polymer Tank 500L", "quantity": 10 },
      { "item": "Polymer Tank 1000L", "quantity": 5 },
      { "item": "Polymer Tank 2000L", "quantity": 2 }
    ],
    "verificationSeal": "VERIFIED-VTMS-SECURE-20260905"
  },
  "data": {
    "_id": "66d82345e12a4b001a222222",
    "sellerId": "66d82345e12a4b001a111111",
    "type": "DELIVERY",
    "amount": 38500.50,
    "date": "2026-09-05T12:00:00.000Z",
    "note": "Dispatched standard polymer water storage tanks batch #101",
    "tank500": 10,
    "tank1000": 5,
    "tank2000": 2,
    "transaction": { ... },
    "receipt": { ... }
  }
}
```

---

#### 3. Get Official Server Receipt Voucher (`/receipt`)
* **Method**: `GET`
* **Route**: `/api/v1/transactions/:id/receipt`
* **Auth**: Bearer Token

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "receipt": {
      "receiptNumber": "RCP-20260905-1049",
      "transactionId": "66d82345e12a4b001a222222",
      "issueDate": "2026-09-05T12:00:00.000Z",
      "type": "DELIVERY",
      "amount": 38500.50,
      "paymentMode": "CASH",
      "note": "Dispatched standard polymer water storage tanks batch #101",
      "company": {
        "name": "Vasudha Polymer",
        "gstNumber": "07AAAAA0000A1Z5",
        "phone": "+91 98765 43210",
        "address": "Plot 42, Industrial Zone, New Delhi - 110020"
      },
      "seller": {
        "_id": "66d82345e12a4b001a111111",
        "name": "Apex Polymer Solutions",
        "email": "contact@apexpolymer.com",
        "phone": "+91 98765 43210",
        "gstNumber": "07AAAAA0000A1Z5"
      },
      "items": [
        { "item": "Polymer Tank 500L", "quantity": 10 },
        { "item": "Polymer Tank 1000L", "quantity": 5 },
        { "item": "Polymer Tank 2000L", "quantity": 2 }
      ],
      "verificationSeal": "VERIFIED-VTMS-SECURE-20260905"
    }
  }
}
```

---

#### 4. Update Transaction (Admin Only)
* **Method**: `PUT`
* **Route**: `/api/v1/transactions/:id`
* **Auth**: Bearer Token (Admin)

**Request Body**:
```json
{
  "amount": 42000.00,
  "note": "Updated batch dispatch count with 2 extra 500L tanks",
  "tank500": 12,
  "tank1000": 5,
  "tank2000": 2
}
```

---

#### 5. Delete Transaction (Admin Only)
* **Method**: `DELETE`
* **Route**: `/api/v1/transactions/:id`
* **Auth**: Bearer Token (Admin)

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Transaction deleted successfully."
}
```

---

### 4.4 Reports & Analytics (`/api/v1/reports`)

#### 1. Get Financial Summary Report
* **Method**: `GET`
* **Route**: `/api/v1/reports/summary`
* **Auth**: Bearer Token

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "totalBilledSales": 1250000.00,
    "totalClearedPayments": 920000.00,
    "totalPendingReceivables": 330000.00,
    "tankTotals": {
      "tank500": 120,
      "tank1000": 85,
      "tank2000": 42
    },
    "topSellers": [
      {
        "sellerId": "66d82345e12a4b001a111111",
        "name": "Apex Polymer Solutions",
        "totalDeliveries": 450000.00,
        "totalPaid": 350000.00,
        "totalDues": 100000.00
      }
    ]
  }
}
```

---

#### 2. Get Tank Summary Report (500L, 1000L, 2000L)
* **Method**: `GET`
* **Route**: `/api/v1/reports/tank-summary`
* **Auth**: Bearer Token

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "tank500": 120,
    "tank1000": 85,
    "tank2000": 42
  }
}
```

---

## ⚡ 5. Real-Time Data & Shimmer Skeleton Loading

To maintain maximum financial integrity and user responsiveness across mobile and web clients:
- **No Stale In-Memory Caching**: All screens must query live data from the server REST API on mount, focus (`useFocusEffect`), and pull-to-refresh.
- **Dark-Themed Shimmer Skeletons**: While network requests are in-flight, render smooth gradient shimmer skeletons (`SellerCardSkeleton`, `TransactionCardSkeleton`, `ReceiptCardSkeleton`, `DashboardSkeleton`, `ReportsSkeleton`) to preserve container layout and eliminate blank white screens.
- **Currency Precision**: All amounts must be formatted with exact 2-decimal precision (`minimumFractionDigits: 2, maximumFractionDigits: 2`).

---

## 📥 6. How to Import the Postman Collection

1. Open **Postman** or **Thunder Client**.
2. Click **Import**.
3. Select `app/api-docs/api-collection.json`.
4. The environment variable `baseUrl` defaults to `http://localhost:5000/api/v1`.
5. Execute the **"Login (Admin / Manager)"** request. The test script automatically captures the returned JWT token and sets `token` in the collection variables.
6. All subsequent requests automatically authenticate with `Bearer {{token}}`.
