import type { ReactNode } from "react";
import { X } from "lucide-react";
type Props = {
  title: string;
  busy: boolean;
  onClose: () => void;
  children: ReactNode;
};
export function Modal({ title, busy, onClose, children }: Props) {
  return (
    <div className="modal-backdrop" onClick={() => !busy && onClose()}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="close"
          aria-label="Close dialog"
          disabled={busy}
          onClick={onClose}
        >
          <X />
        </button>
        <span className="eyebrow">THE FOLIO COLLECTION</span>
        <h2 id="modal-title">{title}</h2>
        {children}
      </section>
    </div>
  );
}
