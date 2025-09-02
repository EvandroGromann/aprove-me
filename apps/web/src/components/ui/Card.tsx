import { PropsWithChildren } from 'react';

export function Card({ children }: PropsWithChildren) {
  return <div className="rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm">{children}</div>;
}

export function CardHeader({ children }: PropsWithChildren) {
  return <div className="px-4 py-3 border-b border-gray-200 bg-white/60 backdrop-blur-0">{children}</div>;
}

export function CardTitle({ children }: PropsWithChildren) {
  return <h3 className="text-base font-semibold">{children}</h3>;
}

export function CardContent({ children }: PropsWithChildren) {
  return <div className="p-4">{children}</div>;
}
