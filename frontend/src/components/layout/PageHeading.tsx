import { Plus } from "lucide-react";
import type { LibraryView } from "../../types/library";
type Props = { view: LibraryView; admin: boolean; onAddBook: () => void };
export function PageHeading({ view, admin, onAddBook }: Props) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">YOUR LIBRARY, CONNECTED</div>
        <h1>
          {view === "catalog"
            ? "Discover the collection"
            : view === "loans"
              ? "Books on their next chapter"
              : "Every chapter, recorded"}
        </h1>
        <p>
          {view === "catalog"
            ? "A home for great books. A starting point for new ideas."
            : view === "loans"
              ? "Keep track of borrowed books and bring them back home."
              : "Explore the complete borrowing and return history."}
        </p>
      </div>
      {admin && view === "catalog" && (
        <button className="primary" onClick={onAddBook}>
          <Plus size={18} />
          Add a book
        </button>
      )}
    </div>
  );
}
