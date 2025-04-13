import React from 'react';
import Link from 'next/link';
import SimpleButton, { type SimpleButtonProps, buttonVariants } from './SimpleButton'; // Import buttonVariants
import { Typography } from './Typography';
import { cn } from '@/lib/utils';
import { type VariantProps } from 'class-variance-authority'; // Import VariantProps

// Inherit variant prop from SimpleButton's variants
interface MenuButtonProps extends Omit<SimpleButtonProps, 'children' | 'variant'>,
                                   VariantProps<typeof buttonVariants> { // Add variant prop
  title: string;
  description: string;
  href?: string; // Optional href for linking
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  // Removed actions prop
}

const MenuButton: React.FC<MenuButtonProps> = ({
  title,
  description,
  href,
  variant, // Destructure variant
  className,
  titleClassName,
  descriptionClassName,
  // Removed actions destructuring
  ...buttonProps // Pass remaining props like onClick to SimpleButton
}) => {
  const content = (
    <SimpleButton
      variant={variant} // Pass variant down
      // Adjust layout: make it flex column, justify between content and actions
      className={cn("w-full text-right flex flex-col items-start justify-between h-full", className)}
      {...buttonProps}
    >
      {/* Main content wrapper */}
      <div>
        <Typography variant="h3" className={cn("mb-1", titleClassName)}>
          {title}
        </Typography>
        {/* Conditionally set description color based on variant */}
      <Typography
        variant="body2"
        color="muted"
          className={cn(
            variant === 'dark' ? "text-gray-300" : "text-amber-800", // Lighter text for dark variant
            descriptionClassName
          )}
        >
          {description}
        </Typography>
      </div>

      {/* Removed Actions area */}
    </SimpleButton>
  );

  // If href is provided, wrap only the main button content in a Link,
  // but render the actions outside the Link to avoid nesting.
  if (href) {
    // When href is provided, wrap SimpleButton inside Link > a
    // Make the Link the relative container
    // When href is provided, style the Link itself like a button
    return (
      <Link
        href={href}
        // Apply button styles and layout directly to the Link
        className={cn(
          buttonVariants({ variant }), // Apply button variant styles
          "relative block h-full w-full text-right flex flex-col items-start justify-between p-4", // Base layout, padding added
           className // Allow overriding classes
         )}
         // Removed {...buttonProps} spread as it's invalid for Link/<a>
       >
         {/* Main content wrapper (Title and Description only) */}
        <div>
          <Typography variant="h3" className={cn("mb-1", titleClassName)}>
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="muted"
            className={cn(
              variant === 'dark' ? "text-gray-300" : "text-amber-800", // Adjust color based on variant
              descriptionClassName
            )}
          >
            {description}
          </Typography>
        </div>
        {/* Removed Placeholder div for actions */}
      </Link>
      // Removed absolutely positioned actions div
    );
  }

  // If no href, render the original content structure
  return content;
};

export default MenuButton;
