import React from "react";
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card py-8 text-center text-sm text-muted-foreground font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} Catetin. Hak Cipta Dilindungi.</p>
        <div className="flex gap-6">
          <Link href="/faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
          <a href="#" className="hover:text-primary transition-colors">
            Kontak
          </a>
        </div>
      </div>
    </footer>
  );
}
