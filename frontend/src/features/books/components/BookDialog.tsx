import { Modal } from "../../../components/ui/Modal";
import { ErrorAlert } from "../../../components/ui/Feedback";
import { BookForm } from "./BookForm";
import { AssignBookForm } from "./AssignBookForm";
import { BookDetails } from "./BookDetails";
import type { Book, BookInput } from "../../../types/library";
export type BookDialogState =
  | { kind: "edit"; book: Book | null }
  | { kind: "detail" | "assign"; book: Book };
type Props = {
  dialog: BookDialogState;
  admin: boolean;
  busy: boolean;
  error: string;
  onClose: () => void;
  onSave: (input: BookInput) => void;
  onDelete: (book: Book) => void;
  onAssign: (id: number) => void;
  onBorrow: (book: Book) => void;
};
export function BookDialog({
  dialog,
  admin,
  busy,
  error,
  onClose,
  onSave,
  onDelete,
  onAssign,
  onBorrow,
}: Props) {
  const title =
    dialog.kind === "edit"
      ? dialog.book
        ? "Edit book"
        : "Add to the collection"
      : dialog.kind === "assign"
        ? "Assign a book"
        : dialog.book.title;
  return (
    <Modal title={title} busy={busy} onClose={onClose}>
      <ErrorAlert message={error} />
      {dialog.kind === "edit" ? (
        <BookForm
          selected={dialog.book}
          busy={busy}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : dialog.kind === "assign" ? (
        <AssignBookForm book={dialog.book} busy={busy} onAssign={onAssign} />
      ) : (
        <BookDetails
          book={dialog.book}
          admin={admin}
          busy={busy}
          onBorrow={onBorrow}
        />
      )}
    </Modal>
  );
}
