import { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function PageLayout({ title, action, children }: PageLayoutProps) {
  return (
    <div>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
        {action}
      </header>
      {children}
    </div>
  );
}
