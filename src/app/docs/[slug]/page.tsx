// This is now a Server Component again
import { promises as fs } from "fs";
import path from "path";
import matter from 'gray-matter';
// Removed useState, useEffect
import { notFound } from "next/navigation";
import { Suspense } from 'react'; // Import Suspense
// Removed MDXRemote, mdxComponents, Container, CopyButton, ChatInterface from here
// Import the client layout component
import DocClientLayout from "./DocClientLayout";
// Removed unused Character type import
// Removed serialize and related imports (moved to client component)
import type { Metadata } from 'next';

// Define interface for expected frontmatter (keep as is)
interface DocFrontmatter {
  lang?: string;
  // Add other frontmatter fields here as needed
}

// Define the type for static params
// Removed unused PageProps type
type StaticParams = {
  slug: string;
};

const contentDir = path.join(process.cwd(), "src", "content", "docs");

// generateStaticParams with explicit return type
export async function generateStaticParams(): Promise<StaticParams[]> {
  try {
    const files = await fs.readdir(contentDir);
    const params = files
      .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
      .map((file) => ({
        slug: file.replace(/\.mdx?$/, ""),
      }));
    return params;
  } catch (error) {
    console.error("Error reading content directory for static params:", error);
    return []; // Return empty array if directory doesn't exist or error
  }
}

// getDocContent remains the same
async function getDocContent(slug: string): Promise<{ data: DocFrontmatter; content: string } | null> {
  // Try both .mdx and .md extensions
  let filePath = path.join(contentDir, `${slug}.mdx`);
  let fileExists = await fs.access(filePath).then(() => true).catch(() => false);

  if (!fileExists) {
    filePath = path.join(contentDir, `${slug}.md`);
    fileExists = await fs.access(filePath).then(() => true).catch(() => false);
  }

  if (!fileExists) {
    return null; // Neither .mdx nor .md found
  }

  try {
    const rawFileContent = await fs.readFile(filePath, "utf-8"); // Corrected typo
    const { data, content } = matter(rawFileContent); // Parse frontmatter
    return { data, content };
  } catch (error) {
    console.error(`Error reading or parsing file ${filePath}:`, error);
    return null; // Return null if error reading
  }
}

// generateMetadata using 'any' for params to bypass type error
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const { slug } = params;
  // Capitalize first letter and replace hyphens with spaces for a nicer title
  const title = slug
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)) // Explicitly type 'word'
    .join(' ');

  return {
    title: `${title} | Exodus Docs`, // Example title format
  };
}

// Define the list of background images
const backgroundImages = [
  '/images/docs-bg/bg1.png',
  '/images/docs-bg/bg2.png',
  '/images/docs-bg/bg3.png',
  '/images/docs-bg/bg4.png',
];

// This is the main Server Component again, using 'any' for params
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function DocPage({ params }: { params: any }) {
  const { slug } = params;

  // --- Server-Side Data Fetching ---
  const docResult = await getDocContent(slug);

  if (!docResult) {
    notFound(); // Trigger 404 if doc not found
  }

  const { data: frontmatter, content: rawSource } = docResult;

  // Removed server-side fetch for devGuideCharacter
  // Removed MDX serialization from server component

  // --- Rendering ---
  // Pass raw source to the client component for client-side serialization
  return (
    <Suspense fallback={<div>Loading...</div>}> {/* Wrap in Suspense */}
      <DocClientLayout
        // serializedSource prop removed
        frontmatter={frontmatter}
        // devGuideCharacter prop removed
        rawSource={rawSource} // Pass raw source for copy button
        backgroundImages={backgroundImages} // Pass the list of images
      />
    </Suspense>
  );
}
