import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "librarian", "member"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 24 }).default("#8d4b5b").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const authors = mysqlTable("authors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  bio: text("bio"),
  nationality: varchar("nationality", { length: 100 }),
  birthDate: varchar("birthDate", { length: 20 }),
  photoUrl: text("photoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const books = mysqlTable("books", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 240 }).notNull().unique(),
  isbn: varchar("isbn", { length: 32 }),
  publisher: varchar("publisher", { length: 180 }),
  publishedYear: int("publishedYear"),
  pages: int("pages"),
  summary: text("summary"),
  coverColor: varchar("coverColor", { length: 24 }).default("#8d4b5b").notNull(),
  coverUrl: text("coverUrl"),
  totalCopies: int("totalCopies").default(1).notNull(),
  availableCopies: int("availableCopies").default(1).notNull(),
  shelf: varchar("shelf", { length: 80 }),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  featured: int("featured").default(0).notNull(),
  categoryId: int("categoryId"),
  authorId: int("authorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const members = mysqlTable("members", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 40 }),
  address: text("address"),
  photoUrl: text("photoUrl"),
  expirationDate: timestamp("expirationDate"),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export const loans = mysqlTable("loans", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull(),
  memberId: int("memberId"),
  librarianId: int("librarianId"),
  requesterName: varchar("requesterName", { length: 180 }).notNull(),
  requesterEmail: varchar("requesterEmail", { length: 320 }).notNull(),
  requesterPhone: varchar("requesterPhone", { length: 40 }),
  message: text("message"),
  status: mysqlEnum("status", ["requested", "approved", "borrowed", "returned", "overdue", "rejected", "cancelled"]).default("requested").notNull(),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  borrowedAt: timestamp("borrowedAt"),
  dueDate: timestamp("dueDate"),
  returnedAt: timestamp("returnedAt"),
});

export const returns = mysqlTable("returns", {
  id: int("id").autoincrement().primaryKey(),
  loanId: int("loanId").notNull(),
  returnedAt: timestamp("returnedAt").defaultNow().notNull(),
  lateDays: int("lateDays").default(0).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contactMessages = mysqlTable("contactMessages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "archived"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  type: varchar("type", { length: 40 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  message: text("message").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Book = typeof books.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Author = typeof authors.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type LibraryReturn = typeof returns.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
