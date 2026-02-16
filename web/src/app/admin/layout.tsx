

import React, { Suspense } from "react";
// Dynamic import must be used to ensure correct hydration if it's large, but here simple import is fine.
// Actually, layout can't import client components directly if they're not 'use client'.
// But AdminLayoutClient IS 'use client'.
import AdminLayoutClient from "@/components/AdminLayoutClient";

export const runtime = 'edge';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </Suspense>
  );
}
