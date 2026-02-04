import { ReactNode } from "react";

interface MainContainerProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export function MainContainer({ children, fullWidth }: MainContainerProps) {
  return (
    <main className={fullWidth ? "" : "max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-12"}>
      {children}
    </main>
  );
}