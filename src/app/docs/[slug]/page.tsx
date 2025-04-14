import { promises as fs } from "fs";
import path from "path";
import matter from 'gray-matter'; // Import gray-matter
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/mdx-components"; // Import custom components
import Container from "@/components/ui/Container"; // Import Container
import { CopyButton } from "@/components/ui/CopyButton"; // Import the new CopyButton
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

// Updated Props type to reflect params being a Promise
type Props = {
  params: Promise<{
    slug: string;
  }>;
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
  const { slug } = await params; // Await params Promise
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


export default async function DocPage({ params }: Props) {
  const { slug } = await params; // Await params Promise
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

  // Determine text direction and container variant based on frontmatter
  const textDirection = frontmatter.lang === 'he' ? 'rtl' : 'ltr';
  const containerVariant = 'bright'; // Use the new bright variant
  const proseClasses = containerVariant === 'bright' ? 'prose' : 'prose prose-invert'; // Adjust prose for contrast

  // Select a random background image
  const randomBgIndex = Math.floor(Math.random() * backgroundImages.length);
  const selectedBgImage = backgroundImages[randomBgIndex];

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen p-4 md:p-8 isolate" // Added padding and flex centering
      style={{
        backgroundImage: `url(${selectedBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Optional: Keep background fixed during scroll
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 w-full h-full bg-black/60 -z-10"></div>

      {/* Content Container */}
      <Container
        variant={containerVariant}
        className="relative w-full max-w-6xl my-4 z-0 h-[70vh] overflow-y-auto" // Added relative positioning
      >
        {/* Add the Copy Button */}
        <CopyButton
          textToCopy={source}
          className="absolute top-4 right-4 z-10" // Position top-right, ensure it's above content
          // Optionally adjust button variant if needed, e.g., variant="dark"
        />
        {/* Apply prose class and conditional direction to the article inside the container */}
        <article
          className={`${proseClasses} max-w-none lg:prose-xl`} // Apply dynamic prose class, removed padding
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
      </Container>
    </div>
  );
}
