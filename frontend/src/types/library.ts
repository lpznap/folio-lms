export type User = { id: number; name: string; email: string; role: string };
export type Book = {
  id: number;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publicationYear: number;
  category: string;
  shelf: string;
  available: boolean;
};
export type Loan = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  user: string;
  email: string;
  borrowedAt: string;
  returnedAt: string | null;
  status: string;
};

export type Member = Pick<User, "id" | "name" | "email">;
export type BookInput = Omit<Book, "id" | "available">;
export type LibraryView = "catalog" | "loans" | "history";
export type LibraryStats = {
  total: number;
  borrowed: number;
  members: number;
  returned: number;
};
export type CatalogFilters = {
  search: string;
  category: string;
  availability: string;
  sort: string;
  page: number;
};
export type BookPage = {
  items: Book[];
  total: number;
  page: number;
  pageSize: number;
};
export type AuthInput = { email: string; password: string; name?: string };
export type AuthResponse = { token: string; user: User };
