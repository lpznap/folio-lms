import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { createLibraryApi } from "../api";
import { errorMessage } from "../../../lib/api-client";
import type {
  Book,
  CatalogFilters,
  LibraryStats,
  Loan,
} from "../../../types/library";
export function useLibraryData() {
  const { api } = useAuth();
  const service = useMemo(() => createLibraryApi(api), [api]);
  const [filters, setFilters] = useState<CatalogFilters>({
    search: "",
    category: "",
    availability: "",
    sort: "title",
    page: 1,
  });
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<LibraryStats>({
    total: 0,
    borrowed: 0,
    members: 0,
    returned: 0,
  });
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      Promise.all([
        service.catalog(filters, controller.signal),
        service.categories(controller.signal),
        service.stats(controller.signal),
        service.loans(controller.signal),
      ])
        .then(([catalog, categories, stats, loans]) => {
          if (!controller.signal.aborted) {
            setBooks(catalog.items);
            setTotal(catalog.total);
            setCategories(categories);
            setStats(stats);
            setLoans(loans);
          }
        })
        .catch((error) => {
          if (!controller.signal.aborted) setError(errorMessage(error));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 200);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [service, filters, revision]);
  return {
    books,
    total,
    categories,
    stats,
    loans,
    loading,
    error,
    filters,
    service,
    refresh: () => setRevision((value) => value + 1),
    updateFilters: (changes: Partial<CatalogFilters>) =>
      setFilters((current) => ({ ...current, ...changes, page: 1 })),
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
  };
}
