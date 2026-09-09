"use client";

import type { ReactNode } from "react";
import { AppProvider } from "@/lib/store";
import CloudSync from "@/components/CloudSync";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <CloudSync />
      {children}
    </AppProvider>
  );
}

