// This is now a Server Component again
import { promises as fs } from "fs";
import path from "path";
import matter from 'gray-matter';
// Removed useState, useEffect
import { notFound } from "next/navigation";
// Removed MDXRemote, mdxComponents, Container, CopyButton, ChatInterface from here
// Import the client layout component
import DocClientLayout from "./DocClientLayout";
// Import Character type for fetching
import type { Character } from "@/components/chat/ChatInterface";
// Import serialize for MDX
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
// Keep these types for options
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";
import type { Element } from "hast";
import type { Metadata } from 'next';

// Define interface for expected frontmatter (keep as is)
interface DocFrontmatter {
  lang?: string;
  // Add other frontmatter fields here as needed
}

// Props type remains the same
type Props = {
  params: {
    slug: string;
  };
};

const contentDir = path.join(process.cwd(), "src", "content", "docs");

// generateStaticParams remains the same
export async function generateStaticParams() {
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
    const rawFileContent = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(rawFileContent); // Parse frontmatter
    return { data, content };
  } catch (error) {
    console.error(`Error reading or parsing file ${filePath}:`, error);
    return null; // Return null if error reading
  }
}

// generateMetadata remains the same
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params; // No need to await here
  // Capitalize first letter and replace hyphens with spaces for a nicer title
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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

// This is the main Server Component again
export default async function DocPage({ params }: Props) {
  const { slug } = params;

  // --- Server-Side Data Fetching ---
  const docResult = await getDocContent(slug);

  if (!docResult) {
    notFound(); // Trigger 404 if doc not found
  }

  const { data: frontmatter, content: rawSource } = docResult;

  // Fetch dev guide character info (handle potential errors)
  let devGuideCharacter: Character | null = null;
  try {
    // Construct absolute URL for server-side fetch if needed, or use relative if base URL is configured
    // Fetch Tomer's info instead of Ohad's
    const charResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/characters/tomer/info.json`);
    if (charResponse.ok) {
      devGuideCharacter = await charResponse.json();
    } else {
      console.warn(`Failed to fetch dev guide info: ${charResponse.statusText}`);
      // Keep devGuideCharacter as null, the client component will handle it
    }
  } catch (err) {
    console.error("Error fetching dev guide character info:", err);
     // Keep devGuideCharacter as null
  }

  // --- MDX Serialization ---
  const prettyCodeOptions: Partial<PrettyCodeOptions> = {
    theme: "one-dark-pro",
    keepBackground: false,
    // Keep other options as they were
    onVisitLine(node: Element) {
      if (node.children.length === 0) {
        node.children = [{ type: "text", value: " " }];
      }
    },
    onVisitHighlightedLine(node: Element) {
      if (!node.properties) node.properties = {};
      if (!node.properties.className) node.properties.className = [];
      if (Array.isArray(node.properties.className)) {
         node.properties.className.push("highlighted");
      }
    },
    onVisitHighlightedChars(node: Element) {
      if (!node.properties) node.properties = {};
      node.properties.className = ["word"];
    },
  };

  const serializedSource = await serialize(rawSource, {
    parseFrontmatter: false, // Already parsed using gray-matter
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
    },
  });

  // --- Rendering ---
  // Pass fetched data and serialized source to the client component
  return (
    <DocClientLayout
      serializedSource={serializedSource}
      frontmatter={frontmatter}
      devGuideCharacter={devGuideCharacter}
      rawSource={rawSource} // Pass raw source for copy button
      backgroundImages={backgroundImages} // Pass the list of images
    />
  );
}
