import {
  BookOpen,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BookCard } from "./BookCard";
import type { Book, CatalogFilters } from "../../../types/library";
type Props = {
  books: Book[];
  total: number;
  categories: string[];
  filters: CatalogFilters;
  loading: boolean;
  busy: boolean;
  admin: boolean;
  onFiltersChange: (filters: Partial<CatalogFilters>) => void;
  onPageChange: (page: number) => void;
  onDetails: (book: Book) => void;
  onBorrow: (book: Book) => void;
  onEdit: (book: Book) => void;
};
export function BookCatalog({
  books,
  total,
  categories,
  filters,
  loading,
  busy,
  admin,
  onFiltersChange,
  onPageChange,
  onDetails,
  onBorrow,
  onEdit,
}: Props) {
  const { search, category, availability, sort, page } = filters;
  return (
    <>
      <section className="collection-head">
        <div>
          <h2>
            All books <span>{total}</span>
          </h2>
          <p>Find something worth getting lost in.</p>
        </div>
        <span className="grid-indicator">
          <LayoutGrid size={17} />
          Grid view
        </span>
      </section>
      <div className="filters">
        <div className="search">
          <Search size={18} />
          <input
            aria-label="Search books"
            placeholder="Search by title, author, or ISBN…"
            value={search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
        </div>
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => onFiltersChange({ category: e.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Availability"
          value={availability}
          onChange={(e) => onFiltersChange({ availability: e.target.value })}
        >
          <option value="">Any availability</option>
          <option value="available">Available</option>
          <option value="borrowed">Borrowed</option>
        </select>
        <div className="sort">
          <SlidersHorizontal size={16} />
          <select
            aria-label="Sort books"
            value={sort}
            onChange={(e) => onFiltersChange({ sort: e.target.value })}
          >
            <option value="title">Title: A–Z</option>
            <option value="author">Author: A–Z</option>
            <option value="year">Newest publication</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="empty">Finding your next read…</div>
      ) : books.length === 0 ? (
        <div className="empty">
          <BookOpen />
          <h3>No books found</h3>
          <p>Try another search or adjust your filters.</p>
          <button
            onClick={() => {
              onFiltersChange({ search: "", category: "", availability: "" });
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((b) => (
            <BookCard
              key={b.id}
              book={b}
              admin={admin}
              busy={busy}
              onDetails={onDetails}
              onBorrow={onBorrow}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
      <footer>
        <span>
          Showing {total ? Math.min((page - 1) * 9 + 1, total) : 0}–
          {Math.min(page * 9, total)} of {total} books
        </span>
        <div>
          <button
            aria-label="Previous page"
            disabled={page === 1 || loading}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Page {page} of {Math.max(1, Math.ceil(total / 9))}
          </span>
          <button
            aria-label="Next page"
            disabled={page * 9 >= total || loading}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>
    </>
  );
}
