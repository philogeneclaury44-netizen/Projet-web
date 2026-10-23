import { and, asc, count, desc, eq, gt, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, authors, books, categories, loans, members, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
const LIBRARIAN_EMAIL = "mikeolivercandio@gmail.com";
const ADMIN_EMAIL = "philogeneclaury44@gmail.com";

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId || user.email?.toLowerCase() === ADMIN_EMAIL) { values.role = "admin"; updateSet.role = "admin"; } else if (user.email?.toLowerCase() === LIBRARIAN_EMAIL) { values.role = "librarian"; updateSet.role = "librarian"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listBooks(filters?: { search?: string; categoryId?: number; authorId?: number; availableOnly?: boolean; year?: number; page?: number; pageSize?: number; sort?: "title" | "year" | "availability" }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(books.status, "active")];
  if (filters?.categoryId) conditions.push(eq(books.categoryId, filters.categoryId));
  if (filters?.authorId) conditions.push(eq(books.authorId, filters.authorId));
  if (filters?.availableOnly) conditions.push(gt(books.availableCopies, 0));
  if (filters?.year) conditions.push(eq(books.publishedYear, filters.year));
  if (filters?.search) {
    const query = `%${filters.search}%`;
    conditions.push(or(like(books.title, query), like(books.summary, query), like(books.isbn, query), like(books.publisher, query))!);
  }
  const order = filters?.sort === "year" ? desc(books.publishedYear) : filters?.sort === "availability" ? desc(books.availableCopies) : asc(books.title);
  let request = db.select().from(books).where(and(...conditions)).orderBy(desc(books.featured), order);
  if (filters?.page && filters.pageSize) request = request.limit(filters.pageSize).offset((filters.page - 1) * filters.pageSize) as typeof request;
  return request;
}

export async function countBooks(filters?: { search?: string; categoryId?: number; authorId?: number; availableOnly?: boolean; year?: number }) {
  const db = await getDb();
  if (!db) return 0;
  const conditions = [eq(books.status, "active")];
  if (filters?.categoryId) conditions.push(eq(books.categoryId, filters.categoryId));
  if (filters?.authorId) conditions.push(eq(books.authorId, filters.authorId));
  if (filters?.availableOnly) conditions.push(gt(books.availableCopies, 0));
  if (filters?.year) conditions.push(eq(books.publishedYear, filters.year));
  if (filters?.search) { const query = `%${filters.search}%`; conditions.push(or(like(books.title, query), like(books.summary, query), like(books.isbn, query), like(books.publisher, query))!); }
  const result = await db.select({ value: count() }).from(books).where(and(...conditions));
  return Number(result[0]?.value ?? 0);
}

export async function listCategories() { const db = await getDb(); if (!db) return []; return db.select().from(categories).orderBy(asc(categories.name)); }
export async function listAuthors() { const db = await getDb(); if (!db) return []; return db.select().from(authors).orderBy(asc(authors.name)); }
export async function getBook(id: number) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(books).where(eq(books.id, id)).limit(1); return result[0]; }
export async function listMembers() { const db = await getDb(); if (!db) return []; return db.select().from(members).orderBy(desc(members.joinedAt)); }
export async function getMemberByUserId(userId: number) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(members).where(eq(members.userId, userId)).limit(1); return result[0]; }
export async function listLoans() { const db = await getDb(); if (!db) return []; const result = await db.select({ loan: loans, bookTitle: books.title }).from(loans).leftJoin(books, eq(loans.bookId, books.id)).orderBy(desc(loans.requestedAt)); return result.map(({ loan, bookTitle }) => ({ ...loan, bookTitle: bookTitle ?? "Livre supprimé" })); }
export async function listMemberLoans(memberId: number) { const db = await getDb(); if (!db) return []; const result = await db.select({ loan: loans, bookTitle: books.title }).from(loans).leftJoin(books, eq(loans.bookId, books.id)).where(eq(loans.memberId, memberId)).orderBy(desc(loans.requestedAt)); return result.map(({ loan, bookTitle }) => ({ ...loan, bookTitle: bookTitle ?? "Livre supprimé" })); }

export async function deleteBook(id: number) { const db = await getDb(); if (!db) return; const active = await db.select({ value: count() }).from(loans).where(and(eq(loans.bookId, id), or(eq(loans.status, "borrowed"), eq(loans.status, "approved")))); if (Number(active[0]?.value ?? 0) > 0) throw new Error("BOOK_HAS_ACTIVE_LOAN"); await db.delete(books).where(eq(books.id, id)); }
export async function deleteCategory(id: number) { const db = await getDb(); if (!db) return; const linked = await db.select({ value: count() }).from(books).where(eq(books.categoryId, id)); if (Number(linked[0]?.value ?? 0) > 0) throw new Error("CATEGORY_IN_USE"); await db.delete(categories).where(eq(categories.id, id)); }
export async function deleteAuthor(id: number) { const db = await getDb(); if (!db) return; const linked = await db.select({ value: count() }).from(books).where(eq(books.authorId, id)); if (Number(linked[0]?.value ?? 0) > 0) throw new Error("AUTHOR_HAS_BOOKS"); await db.delete(authors).where(eq(authors.id, id)); }
export async function deleteMember(id: number) { const db = await getDb(); if (!db) return; await db.delete(members).where(eq(members.id, id)); }

export async function dashboardCounts() {
  const db = await getDb();
  if (!db) return null;
  const [bookCount, availableCount, authorCount, categoryCount, memberCount, activeCount, overdueCount, pendingCount] = await Promise.all([
    db.select({ value: count() }).from(books).where(eq(books.status, "active")),
    db.select({ value: count() }).from(books).where(and(eq(books.status, "active"), gt(books.availableCopies, 0))),
    db.select({ value: count() }).from(authors), db.select({ value: count() }).from(categories), db.select({ value: count() }).from(members),
    db.select({ value: count() }).from(loans).where(or(eq(loans.status, "borrowed"), eq(loans.status, "approved"))),
    db.select({ value: count() }).from(loans).where(eq(loans.status, "overdue")), db.select({ value: count() }).from(loans).where(eq(loans.status, "requested")),
  ]);
  return { books: Number(bookCount[0]?.value ?? 0), availableBooks: Number(availableCount[0]?.value ?? 0), authors: Number(authorCount[0]?.value ?? 0), categories: Number(categoryCount[0]?.value ?? 0), members: Number(memberCount[0]?.value ?? 0), activeLoans: Number(activeCount[0]?.value ?? 0), overdue: Number(overdueCount[0]?.value ?? 0), pendingRequests: Number(pendingCount[0]?.value ?? 0) };
}
