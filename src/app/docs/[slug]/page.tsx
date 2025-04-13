import { promises as fs } from "fs";
import path from "path";
import matter from 'gray-matter'; // Import gray-matter
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/mdx-components"; // Import custom components
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";
import type { Element } from "hast";
import type { Metadata } from 'next';

// Define interface for expected frontmatter
interface DocFrontmatter {
  lang?: string; // Language code (e.g., 'he', 'en')
  // Add other frontmatter fields here as needed
}

type Props = {
  params: {
    slug: string;
  };
};

const contentDir = path.join(process.cwd(), "src", "content", "docs");

// Function to generate static paths (optional but good for performance)
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

// Function to get the parsed content and frontmatter of a specific doc
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

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  // Capitalize first letter and replace hyphens with spaces for a nicer title
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} | Exodus Docs`, // Example title format
  };
}


export default async function DocPage({ params }: Props) {
  const { slug } = params;
  const docData = await getDocContent(slug);

  if (!docData) {
    notFound(); // Trigger 404 if content couldn't be loaded
  }

  const { data: frontmatter, content: source } = docData; // Destructure frontmatter and content

  // Define pretty code options (using the same config as the reference project)
  const prettyCodeOptions: Partial<PrettyCodeOptions> = {
    theme: "one-dark-pro", // Or choose another theme: https://github.com/shikijs/shiki/blob/main/docs/themes.md
    keepBackground: false,
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

  // Determine text direction based on frontmatter
  const textDirection = frontmatter.lang === 'he' ? 'rtl' : 'ltr';

  return (
    // Apply prose class and conditional direction
    <article
      className="prose prose-invert max-w-none p-6 lg:prose-xl"
      dir={textDirection} // Apply direction dynamically
    >
      {/* Render the MDX content */}
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
          },
        }}
      />
    </article>
  );
}
