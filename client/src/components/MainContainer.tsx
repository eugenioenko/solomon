import { ReactNode } from "react";

interface MainContainerProps {
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export function MainContainer({ children, fullWidth, className }: MainContainerProps) {
  return (
    <main className={fullWidth ? `flex w-full flex-grow` : `w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-12 flex-grow` + (className ? ` ${className}` : "")}>
      {children}
    </main>
  );
}