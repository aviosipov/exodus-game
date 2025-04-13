// components/ui/Container.tsx
import React from 'react';
import { cn } from "@/lib/utils"; // Assuming you have a utility like this for class merging

type ContainerVariant = 'default' | 'dialog';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: ContainerVariant;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  const baseStyles = "rounded-lg"; // Common style

  const variantStyles: Record<ContainerVariant, string> = {
    default: "bg-gray-50 border border-gray-300 p-6 shadow-sm",
    dialog: "bg-black/70 text-white border border-gray-600 p-4", // Style from AdventurePage
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        className // Allow overriding and adding classes
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
