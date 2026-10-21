import type { ReactNode } from "react";
import { BookOpen, Library, History, LogOut } from "lucide-react";
import type { LibraryStats, LibraryView, User } from "../../types/library";
type Props = {
  user: User;
  view: LibraryView;
  stats: LibraryStats;
  activeLoans: number;
  onViewChange: (view: LibraryView) => void;
  onSignOut: () => void;
  children: ReactNode;
};
export function AppLayout({
  user,
  view,
  stats,
  activeLoans,
  onViewChange,
  onSignOut,
  children,
}: Props) {
  const admin = user.role === "Librarian";
  return (
    <div className="shell">
      <aside>
        <a className="brand" href="#" onClick={() => onViewChange("catalog")}>
          <BookOpen /> folio<span>LIBRARY MANAGEMENT</span>
        </a>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          <button
            className={view === "catalog" ? "active" : ""}
            onClick={() => onViewChange("catalog")}
          >
            <Library size={19} />
            Book catalog<span>{stats.total}</span>
          </button>
          <button
            className={view === "loans" ? "active" : ""}
            onClick={() => onViewChange("loans")}
          >
            <BookOpen size={19} />
            {admin ? "Active borrowing" : "My borrowing"}
            <span>{activeLoans}</span>
          </button>
          <button
            className={view === "history" ? "active" : ""}
            onClick={() => onViewChange("history")}
          >
            <History size={19} />
            Transaction history
          </button>
        </nav>
        <div className="aside-card">
          <div className="mini-books">▥ ▥ ▥</div>
          <h3>A place for every story.</h3>
          <p>
            Keep your collection organized
            <br />
            and your community reading.
          </p>
          <span>THE FOLIO LIBRARY</span>
        </div>
        <div className="profile">
          <div className="avatar">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <strong>{user.name}</strong>
            <small>{admin ? "Librarian" : "Library member"}</small>
          </div>
          <button title="Sign out" onClick={onSignOut}>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <main>
        <header>
          <span>
            Workspace <span className="slash">/</span>{" "}
            <strong>
              {view === "catalog"
                ? "Book catalog"
                : view === "loans"
                  ? "Borrowing"
                  : "Transaction history"}
            </strong>
          </span>
          <span className="header-right">
            <span className="live-dot" /> Library is open{" "}
            <span className="divider" />{" "}
            <span>
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </span>
          <button
            className="mobile-signout"
            title="Sign out"
            onClick={onSignOut}
          >
            <LogOut size={17} />
          </button>
        </header>

        <div className="content">
          {children}
          <div className="bottom-note">
            <BookOpen size={14} /> A little reading. A world of possibilities.
            <span>FOLIO · LIBRARY MANAGEMENT</span>
          </div>
        </div>
      </main>
    </div>
  );
}
