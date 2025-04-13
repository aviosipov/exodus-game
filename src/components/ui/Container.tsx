// components/ui/Container.tsx
import React from 'react';
import { cn } from "@/lib/utils"; // Assuming you have a utility like this for class merging

// Rename 'default'->'light', 'dialog'->'default'
type ContainerVariant = 'default' | 'light' | 'bright';

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
  // Add common shadow to baseStyles
  const baseStyles = "rounded-lg border border-gray-600 p-4 shadow-md";

  // Remove variant-specific shadows
  const variantStyles: Record<ContainerVariant, string> = {
    default: "bg-gray-900 opacity-80 text-white", // Dark style is now default
    light: "bg-gray-50 opacity-80", // Removed shadow-sm
    bright: "bg-gray-50 opacity-90 text-gray-900", // Made bright variant fully opaque
  };

  return (
    <div
      // Note: The prose styles should be applied to the *content* inside the container,
      // not the container itself. We'll handle this in the page component.
      className={cn(
        baseStyles,
        variantStyles[variant], // This correctly picks the style based on the variant prop
        className // Allow overriding and adding classes
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
