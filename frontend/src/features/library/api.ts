import type { ApiClient } from "../../lib/api-client";
import type {
  BookInput,
  BookPage,
  CatalogFilters,
  LibraryStats,
  Loan,
} from "../../types/library";
export function createLibraryApi(api: ApiClient) {
  return {
    catalog(filters: CatalogFilters, signal?: AbortSignal) {
      const query = new URLSearchParams({
        ...filters,
        page: String(filters.page),
        pageSize: "9",
      });
      return api<BookPage>("/books?" + query, "GET", undefined, signal);
    },
    categories: (signal?: AbortSignal) =>
      api<string[]>("/categories", "GET", undefined, signal),
    stats: (signal?: AbortSignal) =>
      api<LibraryStats>("/stats", "GET", undefined, signal),
    loans: (signal?: AbortSignal) =>
      api<Loan[]>("/loans", "GET", undefined, signal),
    saveBook: (input: BookInput, id?: number) =>
      api<void>("/books" + (id ? "/" + id : ""), id ? "PUT" : "POST", input),
    deleteBook: (id: number) => api<void>("/books/" + id, "DELETE"),
    borrowBook: (id: number, userId?: number) =>
      api<void>(
        `/books/${id}/borrow`,
        "POST",
        userId === undefined ? {} : { userId },
      ),
    returnBook: (id: number) => api<void>(`/loans/${id}/return`, "POST"),
  };
}
