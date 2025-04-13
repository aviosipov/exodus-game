// components/ui/Container.tsx
import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string; // Allow passing additional classes
}

const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`
        bg-gray-50      // Light gray background (adjust like bg-white, bg-gray-100 if needed)
        border          // Add a border
        border-gray-300 // Light gray border color (adjust as needed)
        rounded-lg      // Medium-large rounded corners (adjust like rounded-md, rounded-xl)
        p-6             // Padding inside the container (adjust like p-4, p-8)
        shadow-sm       // Optional: a subtle shadow
        ${className}    // Merge with any additional classes passed in
      `}
    >
      {children}
    </div>
  );
};

export default Container;
