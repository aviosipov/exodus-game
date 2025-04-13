import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Assuming a utility for merging class names

const typographyVariants = cva(
  'font-sans', // Base font style
  {
    variants: {
      variant: {
        h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
        h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
        h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
        h6: 'scroll-m-20 text-base font-semibold tracking-tight',
        body1: 'leading-7 [&:not(:first-child)]:mt-6', // Standard body text
        body2: 'text-sm leading-6', // Slightly smaller body text
        caption: 'text-xs text-muted-foreground', // Small text, often for captions or metadata
        blockquote: 'mt-6 border-l-2 pl-6 italic',
        inlineCode: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        lead: 'text-xl text-muted-foreground', // For introductory paragraphs
        large: 'text-lg font-semibold', // Larger text, less prominent than headings
        small: 'text-sm font-medium leading-none', // Smaller text
        muted: 'text-sm text-muted-foreground', // Muted text color
      },
      color: {
        primary: 'text-primary', // Defined in your Tailwind config
        secondary: 'text-secondary-foreground', // Defined in your Tailwind config
        accent: 'text-accent-foreground', // Defined in your Tailwind config
        destructive: 'text-destructive', // Defined in your Tailwind config
         muted: 'text-muted-foreground', // Defined in your Tailwind config
         inherit: 'text-inherit', // Inherit color from parent
         'indigo-glow': 'text-indigo-700 drop-shadow-sm drop-shadow-indigo-50', // New variant for specific glow
       },
       // Add other potential variants like weight, alignment etc. if needed
       // weight: {
      //   light: 'font-light',
      //   normal: 'font-normal',
      //   medium: 'font-medium',
      //   semibold: 'font-semibold',
      //   bold: 'font-bold',
      //   extrabold: 'font-extrabold',
      // },
      // align: {
      //   left: 'text-left',
      //   center: 'text-center',
      //   right: 'text-right',
      //   justify: 'text-justify',
      // }
    },
    defaultVariants: {
      variant: 'body1',
      color: 'inherit',
      // weight: 'normal',
      // align: 'left',
    },
  }
);

// Mapping variants to default HTML tags
const variantMapping = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  blockquote: 'blockquote',
  inlineCode: 'code',
  lead: 'p',
  large: 'div',
  small: 'small',
  muted: 'p',
};

// Omit the conflicting 'color' prop from HTMLAttributes
type BaseHtmlProps = Omit<React.HTMLAttributes<HTMLElement>, 'color'>;

export interface TypographyProps
  extends BaseHtmlProps, // Use the modified base props
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType; // Allow overriding the tag
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, color, as, children, ...props }, ref) => {
    const Comp = as || variantMapping[variant || 'body1'] || 'p'; // Fallback to 'p' if variant is null/undefined
    return (
      <Comp
        className={cn(typographyVariants({ variant, color, className }))}
        ref={ref} // Use the ref directly, forwardRef handles the type
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Typography.displayName = 'Typography';

export { Typography, typographyVariants };
