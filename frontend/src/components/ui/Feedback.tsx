import { Check, X } from "lucide-react";
export function ErrorAlert({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  if (!message) return null;
  return (
    <div className="error" role="alert">
      {message}
      {onRetry && <button onClick={onRetry}>Try again</button>}
    </div>
  );
}
export function SuccessNotice({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  if (!message) return null;
  return (
    <div className="notice" role="status">
      <Check size={16} />
      {message}
      <button aria-label="Dismiss" onClick={onDismiss}>
        <X size={15} />
      </button>
    </div>
  );
}
