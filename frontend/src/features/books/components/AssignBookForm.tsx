import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { errorMessage } from "../../../lib/api-client";
import { ErrorAlert } from "../../../components/ui/Feedback";
import type { Book, Member } from "../../../types/library";
type Props = { book: Book; busy: boolean; onAssign: (id: number) => void };
export function AssignBookForm({ book, busy, onAssign }: Props) {
  const { api } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState("");
  const [memberError, setMemberError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    api<Member[]>("/users", "GET", undefined, controller.signal)
      .then(setMembers)
      .catch((error) => {
        if (!controller.signal.aborted) setMemberError(errorMessage(error));
      });
    return () => controller.abort();
  }, [api]);
  return (
    <>
      <ErrorAlert message={memberError} />{" "}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAssign(Number(memberId));
        }}
      >
        <p>{book.title}</p>
        <label>
          Choose a borrower
          <select
            autoFocus
            required
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          >
            <option value="">Select a member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {m.email}
              </option>
            ))}
          </select>
        </label>
        <button className="primary" disabled={busy || !memberId}>
          Confirm assignment <ArrowUpRight size={16} />
        </button>
      </form>
    </>
  );
}
