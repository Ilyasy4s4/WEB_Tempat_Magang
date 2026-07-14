// components/atoms/Card.tsx
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode; // ReactNode memungkinkan isi berupa teks, HTML, atau komponen lain
  className?: string; // Untuk kustomisasi tambahan lewat Tailwind
}

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`cursor-pointer bg-white shadow-md rounded overflow-hidden border border-gray-300 border-r-6 border-r-red-900 p-6 ${className}`}
    >
      {children}
    </div>
  );
};

