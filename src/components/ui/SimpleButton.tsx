import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Assuming utility exists

const buttonVariants = cva(
  // Base styles applied to all variants
  `px-10 py-4 font-bold rounded-lg transition duration-300 text-xl border-b-4
   active:border-b-0 active:mt-1 transform hover:scale-105 font-sans
   disabled:opacity-50 disabled:cursor-not-allowed`,
  {
    variants: {
      variant: {
        default: `
          bg-yellow-500 text-indigo-900 border-yellow-700
          hover:bg-yellow-400 opacity-80`, // Original style
        secondary: `
          bg-gray-500 text-white border-gray-700
          hover:bg-gray-400 opacity-90`, // Gray variant
        bright: `
          bg-blue-600 text-white border-blue-800
          hover:bg-blue-500 opacity-90`, // Bright blue variant
        dark: `
          bg-gray-800 text-white border-gray-900
          hover:bg-gray-700 opacity-95`, // Dark variant
      },
      // Add other variants like size if needed later
      // size: {
      //   default: 'h-10 px-4 py-2',
      //   sm: 'h-9 rounded-md px-3',
      //   lg: 'h-11 rounded-md px-8',
      //   icon: 'h-10 w-10',
      // },
    },
    defaultVariants: {
      variant: 'default',
      // size: 'default',
    },
  }
);

// Update props to include variants
export interface SimpleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // children is already included in ButtonHTMLAttributes, but we keep it explicit if needed
  // children: React.ReactNode;
}

const SimpleButton = React.forwardRef<HTMLButtonElement, SimpleButtonProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, className }))} // Use cn and pass variant
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SimpleButton.displayName = 'SimpleButton';

export default SimpleButton;
export { buttonVariants }; // Export variants if needed elsewhere
