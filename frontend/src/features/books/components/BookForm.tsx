import { useState } from "react";
import type { Book, BookInput } from "../../../types/library";
type Props = {
  selected: Book | null;
  busy: boolean;
  onSave: (input: BookInput) => void;
  onDelete: (book: Book) => void;
};
const blank: BookInput = {
  isbn: "",
  title: "",
  author: "",
  publisher: "",
  publicationYear: 2026,
  category: "",
  shelf: "",
};
export function BookForm({ selected, busy, onSave, onDelete }: Props) {
  const [form, setForm] = useState<BookInput>(() =>
    selected
      ? {
          isbn: selected.isbn,
          title: selected.title,
          author: selected.author,
          publisher: selected.publisher,
          publicationYear: selected.publicationYear,
          category: selected.category,
          shelf: selected.shelf,
        }
      : { ...blank },
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <div className="form-grid">
        {Object.entries(form).map(([k, v]) => (
          <label key={k}>
            {(
              {
                isbn: "ISBN",
                publicationYear: "Publication year",
                shelf: "Shelf / location",
              } as Record<string, string>
            )[k] || k}
            <input
              required
              maxLength={
                k === "isbn"
                  ? 32
                  : k === "category" || k === "shelf"
                    ? 100
                    : 200
              }
              type={k === "publicationYear" ? "number" : "text"}
              min={k === "publicationYear" ? 1000 : undefined}
              max={k === "publicationYear" ? 2100 : undefined}
              value={v}
              onChange={(e) =>
                setForm({
                  ...form,
                  [k]:
                    k === "publicationYear"
                      ? Number(e.target.value)
                      : e.target.value,
                })
              }
            />
          </label>
        ))}
      </div>
      <div className="modal-actions">
        {selected && (
          <button
            type="button"
            className="danger"
            disabled={busy}
            onClick={() => {
              if (
                window.confirm(
                  `Remove “${selected.title}” from inventory? History will be preserved.`,
                )
              )
                onDelete(selected);
            }}
          >
            Remove book
          </button>
        )}
        <button type="submit" className="primary" disabled={busy}>
          {busy ? "Saving…" : "Save book"}
        </button>
      </div>
    </form>
  );
}
