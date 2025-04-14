'use client'; // Mark as a Client Component

import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react'; // Using lucide icons for feedback
import { cn } from '@/lib/utils'; // Import cn for conditional classes

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, className }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (isCopied) return; // Prevent multiple rapid clicks while showing "Copied"

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Optionally, add user feedback for error, maybe change icon to an error icon
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'p-2 rounded-md transition-colors duration-200 ease-in-out', // Base styling: padding, rounded corners, transition
        'text-gray-400 hover:text-gray-100 hover:bg-gray-700', // Text color, hover effects
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500', // Focus state
        isCopied ? 'text-green-400 hover:text-green-400 hover:bg-transparent cursor-default' : '', // Styles when copied
        className // Allow overriding/extending styles
      )}
      aria-label={isCopied ? 'Copied!' : 'Copy MDX source to clipboard'}
      title={isCopied ? 'Copied!' : 'Copy MDX source'} // Tooltip
      disabled={isCopied} // Disable button briefly after copying
    >
      {isCopied ? (
        <Check size={18} /> // Slightly larger icon
      ) : (
        <Clipboard size={18} /> // Slightly larger icon
      )}
    </button>
  );
};
