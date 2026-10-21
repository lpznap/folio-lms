import { History } from "lucide-react";
import type { LibraryView, Loan } from "../../../types/library";
type Props = {
  loans: Loan[];
  view: Exclude<LibraryView, "catalog">;
  loading: boolean;
  busy: boolean;
  admin: boolean;
  onReturn: (id: number) => void;
};
export function LoanHistory({
  loans,
  view,
  loading,
  busy,
  admin,
  onReturn,
}: Props) {
  return (
    <section className="transactions">
      <div className="collection-head">
        <h2>{view === "loans" ? "Active loans" : "Borrowing & returns"}</h2>
        <span>{admin ? "All members" : "Your activity"}</span>
      </div>
      {loading ? (
        <div className="empty">Loading activity…</div>
      ) : loans.filter((l) => view === "history" || !l.returnedAt).length ===
        0 ? (
        <div className="empty">
          <History />
          <h3>No activity yet</h3>
          <p>Your library journey starts with a book.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Book / ISBN</th>
                {admin && <th>Borrower</th>}
                <th>Borrowed</th>
                <th>Returned</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loans
                .filter((l) => view === "history" || !l.returnedAt)
                .map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.title}</strong>
                      <small>{l.isbn}</small>
                    </td>
                    {admin && (
                      <td>
                        {l.user}
                        <small>{l.email}</small>
                      </td>
                    )}
                    <td>{new Date(l.borrowedAt).toLocaleDateString()}</td>
                    <td>
                      {l.returnedAt
                        ? new Date(l.returnedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={
                          "table-badge " + (l.returnedAt ? "" : "borrowed")
                        }
                      >
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {!l.returnedAt && (
                        <button disabled={busy} onClick={() => onReturn(l.id)}>
                          Return book
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
