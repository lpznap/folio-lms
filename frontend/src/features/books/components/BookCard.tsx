import { ArrowUpRight, MapPin } from "lucide-react";
import type { Book } from "../../../types/library";
const colors = [
  "#e4c39a",
  "#c5d6cb",
  "#cfcedd",
  "#c8d7e4",
  "#e3c6be",
  "#ded9b6",
];

type Props = {
  book: Book;
  admin: boolean;
  busy: boolean;
  onDetails: (book: Book) => void;
  onBorrow: (book: Book) => void;
  onEdit: (book: Book) => void;
};
export function BookCard({
  book: b,
  admin,
  busy,
  onDetails,
  onBorrow,
  onEdit,
}: Props) {
  return (
    <article className="book-card">
      <button
        className="cover-zone"
        onClick={() => onDetails(b)}
        aria-label={"View " + b.title}
      >
        <span className={"badge " + (!b.available ? "borrowed" : "")}>
          <i />
          {b.available ? "Available" : "Borrowed"}
        </span>
        <div
          className={"book-cover cover-" + (b.id % 4)}
          style={{ background: colors[b.id % colors.length] }}
        >
          <span className="cover-top">THE FOLIO COLLECTION</span>
          <strong>{b.title}</strong>
          <span className="cover-line" />
          <small>{b.author}</small>
          <div className="cover-art">
            {b.id % 3 === 0 ? "✳" : b.id % 3 === 1 ? "◒" : "◎"}
          </div>
        </div>
        <span className="cover-shadow" />
      </button>
      <div className="book-info">
        <span className="category">{b.category}</span>
        <button className="book-title" onClick={() => onDetails(b)}>
          {b.title}
        </button>
        <p>{b.author}</p>
        <div className="book-meta">
          <span>
            <MapPin size={13} />
            Shelf {b.shelf}
          </span>
          <span>{b.publicationYear}</span>
        </div>
        <div className="book-actions">
          <button disabled={!b.available || busy} onClick={() => onBorrow(b)}>
            {b.available
              ? admin
                ? "Assign book"
                : "Borrow book"
              : "Currently borrowed"}
            {b.available && <ArrowUpRight size={15} />}
          </button>
          {admin && (
            <button className="edit-btn" onClick={() => onEdit(b)}>
              Edit
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
