# INVOFEST - Backend API

Backend API untuk aplikasi **INVOFEST** menggunakan:

* Express JS
* TypeScript
* Prisma ORM
* MySQL
* JWT Authentication
* Bcrypt Password Hashing

---

# Features

 Register User
 Login User
 JWT Authentication
 CRUD User
 CRUD Event
 CRUD Category
 CRUD Speaker
 Prisma ORM + MySQL
 REST API

---

# Tech Stack

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* MySQL (XAMPP)
* JWT
* Bcrypt

---

# Installation

## 1. Clone Repository

```bash
git clone https://github.com/Ilyasy4s4/Tugas_BE_Invofest.git
```

---

## 2. Masuk ke Folder Project

```bash
cd Tugas_BE_Invofest
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Setup Environment

Buat file `.env`

```env
DATABASE_URL="mysql://root@localhost:3306/invofest"
JWT_SECRET=INVOFEST_SECRET
```

---

## 5. Jalankan Migration Prisma

```bash
npx prisma migrate dev
```

---

## 6. Generate Prisma Client

```bash
npx prisma generate
```

---

## 7. Jalankan Server

```bash
npm run dev
```

Server berjalan di:

```txt
http://localhost:3000
```

---

# API Endpoint

## Authentication

### Register

```http
POST /auth/register
```

Body:

```json
{
  "name": "Ilyas",
  "nim": "24090045",
  "password": "ilyas123"
}
```

---

### Login

```http
POST /auth/login
```

Body:

```json
{
  "nim": "24090045",
  "password": "ilyas123"
}
```

---

# User Endpoint

## Get All User

```http
GET /users
```

---

## Get User By ID

```http
GET /users/:id
```

---

## Update User

```http
PUT /users/:id
```

---

## Delete User

```http
DELETE /users/:id
```

---

# Database Schema

## User

| Field    | Type   |
| -------- | ------ |
| id       | Int    |
| name     | String |
| nim      | String |
| password | String |

---

# Author

Muhamad Ilyas

