"use client";

import type { ReactNode } from "react";
import { AppProvider } from "@/lib/store";

export function Providers({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
