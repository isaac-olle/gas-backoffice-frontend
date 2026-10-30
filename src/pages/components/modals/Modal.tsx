import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function Modal({
  title,
  onClose,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
}: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className={`bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 ${headerClassName}`}>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition"
            aria-label="Tancar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={`p-5 ${contentClassName}`}>{children}</div>
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-800/60 last:border-0">
      <span className="text-xs text-slate-500 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-200 text-right break-all">{children}</span>
    </div>
  );
}
