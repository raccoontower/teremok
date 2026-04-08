import type { ReactNode } from 'react';

interface StaticPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function StaticPage({ title, subtitle, children }: StaticPageProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-primary-600 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-primary-100 text-lg">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-6 text-neutral-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-neutral-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-neutral-800 [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-neutral-700 [&_a]:text-primary-600 [&_a]:underline">
          {children}
        </div>
      </div>
    </div>
  );
}
