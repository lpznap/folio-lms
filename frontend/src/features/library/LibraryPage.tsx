import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { AppLayout } from "../../components/layout/AppLayout";
import { PageHeading } from "../../components/layout/PageHeading";
import { ErrorAlert, SuccessNotice } from "../../components/ui/Feedback";
import { LibraryStats } from "./components/LibraryStats";
import { useLibraryData } from "./hooks/useLibraryData";
import { BookCatalog } from "../books/components/BookCatalog";
import {
  BookDialog,
  type BookDialogState,
} from "../books/components/BookDialog";
import { LoanHistory } from "../loans/components/LoanHistory";
import { errorMessage } from "../../lib/api-client";
import type { Book, BookInput, LibraryView, User } from "../../types/library";
export function LibraryPage({ user }: { user: User }) {
  const { signOut } = useAuth();
  const library = useLibraryData();
  const admin = user.role === "Librarian";
  const [view, setView] = useState<LibraryView>("catalog");
  const [dialog, setDialog] = useState<BookDialogState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  function openDialog(next: BookDialogState) {
    setError("");
    setDialog(next);
  }
  async function perform(operation: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError("");
    try {
      await operation();
      setNotice(message);
      setDialog(null);
      library.refresh();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  function borrow(book: Book) {
    if (admin) openDialog({ kind: "assign", book });
    else
      void perform(
        () => library.service.borrowBook(book.id),
        "Book borrowed. Enjoy your next chapter!",
      );
  }
  function saveBook(input: BookInput) {
    void perform(
      () => library.service.saveBook(input, dialog?.book?.id),
      "Collection updated.",
    );
  }
  return (
    <AppLayout
      user={user}
      view={view}
      stats={library.stats}
      activeLoans={library.loans.filter((loan) => !loan.returnedAt).length}
      onViewChange={setView}
      onSignOut={signOut}
    >
      <PageHeading
        view={view}
        admin={admin}
        onAddBook={() => openDialog({ kind: "edit", book: null })}
      />
      <LibraryStats stats={library.stats} admin={admin} />
      <ErrorAlert
        message={error || library.error}
        onRetry={() => {
          setError("");
          library.refresh();
        }}
      />
      <SuccessNotice message={notice} onDismiss={() => setNotice("")} />
      {view === "catalog" ? (
        <BookCatalog
          books={library.books}
          total={library.total}
          categories={library.categories}
          filters={library.filters}
          loading={library.loading}
          busy={busy}
          admin={admin}
          onFiltersChange={library.updateFilters}
          onPageChange={library.setPage}
          onDetails={(book) => openDialog({ kind: "detail", book })}
          onBorrow={borrow}
          onEdit={(book) => openDialog({ kind: "edit", book })}
        />
      ) : (
        <LoanHistory
          view={view}
          loans={library.loans}
          loading={library.loading}
          busy={busy}
          admin={admin}
          onReturn={(id) =>
            void perform(
              () => library.service.returnBook(id),
              "Return recorded. Welcome back, book!",
            )
          }
        />
      )}
      {dialog && (
        <BookDialog
          key={dialog.kind + "-" + (dialog.book?.id ?? "new")}
          dialog={dialog}
          admin={admin}
          busy={busy}
          error={error}
          onClose={() => setDialog(null)}
          onSave={saveBook}
          onDelete={(book) =>
            void perform(
              () => library.service.deleteBook(book.id),
              "Book removed from inventory.",
            )
          }
          onAssign={(id) =>
            void perform(
              () => library.service.borrowBook(dialog.book!.id, id),
              "Book assigned to member.",
            )
          }
          onBorrow={borrow}
        />
      )}
    </AppLayout>
  );
}
