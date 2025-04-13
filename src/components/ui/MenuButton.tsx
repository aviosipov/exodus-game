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

  if (href) {
    // Using legacyBehavior with passHref allows Link to pass href to the underlying SimpleButton (or its wrapper)
    // If SimpleButton directly renders an `<a>` tag, legacyBehavior might not be needed.
    // Adjust based on SimpleButton's implementation. Assuming SimpleButton doesn't render `<a>`.
    return <Link href={href} passHref legacyBehavior><a>{content}</a></Link>;
  }

  return content;
};

export default MenuButton;
