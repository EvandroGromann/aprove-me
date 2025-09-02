import { PropsWithChildren } from 'react';

interface ComponentProps extends PropsWithChildren {
  className?: string;
}

export function Card({ children, className = '' }: ComponentProps) {
  return <div className={`rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }: ComponentProps) {
  return <div className={`px-4 py-3 border-b border-gray-200 bg-white/60 backdrop-blur-0 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: ComponentProps) {
  return <h3 className={`text-base font-semibold ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: ComponentProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
