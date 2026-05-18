import Link from 'next/link'

export function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b border-border/30">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link href="/" className="text-xl font-serif tracking-[0.15em] text-foreground hover:text-primary transition-colors">
            zhyto.london
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
        <div className="prose-custom">
          {children}
        </div>
      </article>

      <footer className="border-t border-border/30 py-8">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[11px] text-muted-foreground tracking-[0.15em]">
            &copy; 2026 zhyto.london. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        .prose-custom h1 {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 2.5rem;
          font-weight: 300;
          margin-bottom: 1rem;
        }
        .prose-custom .date {
          font-size: 0.875rem;
          margin-bottom: 3rem;
          letter-spacing: 0.05em;
        }
        .prose-custom h2 {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 1.35rem;
          font-weight: 500;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
        }
        .prose-custom p {
          font-size: 1rem;
          line-height: 1.8;
          margin-bottom: 1.25rem;
        }
        .prose-custom ul {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .prose-custom li {
          font-size: 1rem;
          line-height: 1.8;
          margin-bottom: 0.25rem;
        }
        .prose-custom li::marker {
          color: var(--primary);
        }
      `}</style>
    </main>
  )
}
