// components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary', // Default to primary
  className = '',
  ...props // Pass other button attributes like onClick, disabled, etc.
}) => {
  const baseStyle = `
    px-4 py-2           // Horizontal and vertical padding
    rounded-md          // Medium rounded corners (adjust like rounded-lg)
    // font-semibold removed - apply specifically where needed
    focus:outline-none  // Remove default browser focus outline
    focus:ring-2        // Add a ring on focus for accessibility
    focus:ring-offset-2 // Offset the ring slightly
    shadow-sm           // Corrected to subtle shadow (was shadow-lg)
    transition-colors   // Smooth transition for hover/active states
    disabled:opacity-50 // Reduce opacity when disabled
    disabled:cursor-not-allowed
  `;

  let variantStyle = '';
  switch (variant) {
    case 'secondary':
      variantStyle = `
        bg-amber-50/80    // Very light amber/sand background with some transparency
        text-amber-800    // Dark amber text
        border-b-2        // Bottom border only, slightly thicker (Restored)
        border-amber-600  // Amber border color (Restored)
        hover:bg-amber-100 // Slightly darker sand on hover
        focus:ring-amber-500 // Focus ring color
      `;
      break;
    case 'destructive':
      variantStyle = `
        bg-red-600        // Red background
        text-white        // White text
        hover:bg-red-700  // Darker red on hover
        focus:ring-red-500  // Focus ring color
      `;
      break;
    case 'primary':
    default:
      variantStyle = `
        bg-amber-700      // Dark amber/brown background
        text-white        // White text
        border-b-2        // Bottom border only, slightly thicker
        border-amber-900  // Darker amber border for primary
        hover:bg-amber-800 // Darker amber/brown on hover
        focus:ring-amber-500 // Focus ring color
      `;
      break;
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
