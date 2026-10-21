import type { Book } from "../../../types/library";
type Props = {
  book: Book;
  admin: boolean;
  busy: boolean;
  onBorrow: (book: Book) => void;
};
export function BookDetails({ book, admin, busy, onBorrow }: Props) {
  return (
    <>
      <p className="detail-author">by {book.author}</p>
      <dl>
        {[
          ["ISBN", book.isbn],
          ["Publisher", book.publisher],
          ["Publication year", book.publicationYear],
          ["Category", book.category],
          ["Shelf / location", book.shelf],
          ["Availability", book.available ? "Available" : "Borrowed"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <button
        className="primary"
        disabled={!book.available || busy}
        onClick={() => onBorrow(book)}
      >
        {book.available
          ? admin
            ? "Assign this book"
            : "Borrow this book"
          : "Currently borrowed"}
      </button>
    </>
  );
}
