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
  actions?: React.ReactNode; // Add actions prop
}

const MenuButton: React.FC<MenuButtonProps> = ({
  title,
  description,
  href,
  variant, // Destructure variant
  className,
  titleClassName,
  descriptionClassName,
  actions, // Destructure actions
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

      {/* Actions area - Render if actions exist */}
      {actions && (
        <div className="mt-auto pt-2 w-full flex justify-end"> {/* Push actions to the bottom right */}
          {actions}
        </div>
      )}
    </SimpleButton>
  );

  // If href is provided, wrap only the main button content in a Link,
  // but render the actions outside the Link to avoid nesting.
  if (href) {
    // When href is provided, wrap SimpleButton inside Link > a
    return (
      <div className={cn("relative", className)}> {/* Container for positioning actions */}
        <Link href={href} className="block h-full"> {/* Make Link a block element */}
          {/* The SimpleButton now acts as the content of the link */}
          <SimpleButton
            variant={variant}
            // Apply necessary styling for the button itself
            className={cn("w-full text-right flex flex-col items-start justify-between h-full", className)}
            {...buttonProps} // Pass button props like onClick
          >
            {/* Main content wrapper */}
            <div>
              <Typography variant="h3" className={cn("mb-1", titleClassName)}>
                {title}
              </Typography>
              <Typography
                variant="body2"
                color="muted"
                className={cn(
                  variant === 'dark' ? "text-gray-300" : "text-amber-800",
                  descriptionClassName
                )}
              >
                {description}
              </Typography>
            </div>
            {/* Placeholder for spacing, actions will be positioned absolutely */}
             {actions && <div className="mt-auto pt-2 h-6" />} {/* Adjust height as needed */}
          </SimpleButton>
        </Link>
        {/* Render actions outside the Link, positioned absolutely */}
        {actions && (
          <div className="absolute bottom-2 right-4 z-10"> {/* Position actions */}
             {actions}
          </div>
        )}
      </div>
    );
  }

  // If no href, render the original content structure
  return content;
};

export default MenuButton;
