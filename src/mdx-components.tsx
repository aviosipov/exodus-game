import React from "react";
import type { MDXComponents } from "mdx/types";
// Removed Checkbox import as it's not available/needed here

// This file allows you to provide custom React components
// to be used for rendering MDX content.

// Removed parseTaskListItem and createSafeId helper functions as they are no longer needed


export const mdxComponents: MDXComponents = {
  // Allows customizing built-in components, e.g. h1.
  h1: ({ children }) => (
    <h1 className="mt-2 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-6 scroll-m-20 text-lg font-semibold tracking-tight">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} className="font-medium text-primary underline underline-offset-4">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>,
  ol: ({ children }) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>
  ),
  // Use standard li styling
  li: ({ children, ...props }) => <li className="my-2" {...props}>{children}</li>,
  // Add styling for code blocks, tables, etc. as needed
  // Remove pre override, let rehype-pretty-code handle it fully
  // Simplify code override to only style inline code, assuming block code is handled by rehype-pretty-code
  code: ({ children, ...props }) => (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props}>
      {children}
    </code>
  ),
  // Add basic table styling
  table: ({ children }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="m-0 border-t p-0 even:bg-muted">{children}</tr>,
  th: ({ children }) => (
    <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </td>
  ),
  // Ensure code blocks (pre) are always LTR
  pre: ({ children, ...props }) => (
    <pre dir="ltr" {...props}>
      {children}
    </pre>
  ),
};
