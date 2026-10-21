import {
  Library,
  Check,
  ArrowUpRight,
  Users,
  ArrowDownLeft,
} from "lucide-react";
import type { LibraryStats as Stats } from "../../../types/library";
export function LibraryStats({
  stats,
  admin,
}: {
  stats: Stats;
  admin: boolean;
}) {
  return (
    <div className="stats">
      <div>
        <span className="stat-icon">
          <Library />
        </span>
        <div>
          <small>Total collection</small>
          <strong>
            {stats.total.toLocaleString()}
            <em>books</em>
          </strong>
        </div>
      </div>
      <div>
        <span className="stat-icon">
          <Check />
        </span>
        <div>
          <small>Available to borrow</small>
          <strong>
            {stats.total - stats.borrowed}
            <em>on the shelves</em>
          </strong>
        </div>
      </div>
      <div>
        <span className="stat-icon tan">
          <ArrowUpRight />
        </span>
        <div>
          <small>Currently borrowed</small>
          <strong>
            {stats.borrowed}
            <em>in good hands</em>
          </strong>
        </div>
      </div>
      <div>
        <span className="stat-icon purple">
          {admin ? <Users /> : <ArrowDownLeft />}
        </span>
        <div>
          <small>{admin ? "Library members" : "Books returned"}</small>
          <strong>
            {admin ? stats.members : stats.returned}
            <em>{admin ? "and growing" : "back home"}</em>
          </strong>
        </div>
      </div>
    </div>
  );
}
