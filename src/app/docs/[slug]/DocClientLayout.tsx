"use client";

import { useState, useEffect } from "react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from 'next-mdx-remote/serialize'; // Import serialize
import remarkGfm from "remark-gfm"; // Import remarkGfm
import rehypePrettyCode from "rehype-pretty-code"; // Import rehypePrettyCode
import type { Options as PrettyCodeOptions } from "rehype-pretty-code"; // Import types
import type { Element, Root } from "hast"; // Import Root type
import { visit } from 'unist-util-visit'; // Import visit for tree traversal
import { mdxComponents } from "@/mdx-components";
import Container from "@/components/ui/Container";
import { CopyButton } from "@/components/ui/CopyButton";
import { ChatInterface, Character } from "@/components/chat/ChatInterface";
// Removed unused PrettyCodeOptions and Element types

// Define interface for expected frontmatter (can be reused or imported)
interface DocFrontmatter {
  lang?: string;
}

// Define the props the client component will receive (remove serializedSource)
interface DocClientLayoutProps {
  frontmatter: DocFrontmatter;
  rawSource: string;
  backgroundImages: string[];
}

// Define the list of background images (could also be passed as prop)
const defaultBackgroundImages = [
    '/images/docs-bg/bg1.png',
    '/images/docs-bg/bg2.png',
    '/images/docs-bg/bg3.png',
    '/images/docs-bg/bg4.png',
];


export default function DocClientLayout({
  // serializedSource removed from destructuring
  frontmatter,
  rawSource,
  backgroundImages = defaultBackgroundImages
}: DocClientLayoutProps) {
  // State for character data, loading, and error
  const [characterData, setCharacterData] = useState<Character | null>(null);
  const [isCharLoading, setIsCharLoading] = useState(true); // Renamed for clarity
  const [charError, setCharError] = useState<string | null>(null); // Renamed for clarity

  // State for MDX serialization
  const [serializedSource, setSerializedSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [isSerializing, setIsSerializing] = useState(true);
  const [serializeError, setSerializeError] = useState<string | null>(null);

  // Fetch character data on component mount
  useEffect(() => {
    async function fetchCharacterData() {
      setIsCharLoading(true);
      setCharError(null);
      try {
        // Fetch Tomer's info
        const charResponse = await fetch(`/characters/tomer/info.json`);
        if (charResponse.ok) {
          const data = await charResponse.json();
          setCharacterData(data);
        } else {
          console.warn(`Failed to fetch dev guide info: ${charResponse.statusText}`);
          setCharError(`Failed to load chat character: ${charResponse.statusText}`);
        }
      } catch (err) {
        console.error("Error fetching dev guide character info:", err);
        setCharError("Error loading chat character.");
      } finally {
        setIsCharLoading(false);
      }
    }
    fetchCharacterData();
  }, []);

  // Serialize MDX source on component mount or when rawSource changes
  useEffect(() => {
    async function serializeMdx() {
      setIsSerializing(true);
      setSerializeError(null);
      try {
        const prettyCodeOptions: Partial<PrettyCodeOptions> = {
          theme: "one-dark-pro",
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
          // REMOVED invalid onVisitPre hook
        };

        // Custom rehype plugin to force LTR on code blocks
        // Custom rehype plugin to add a class for CSS targeting
        const rehypeAddCodeBlockClass = () => (tree: Root) => {
          visit(tree, 'element', (preNode: Element) => {
            // Target the <pre> element generated by rehype-pretty-code
            if (preNode.tagName === 'pre') {
              if (!preNode.properties) preNode.properties = {};
              // Ensure className is an array
              if (!preNode.properties.className) {
                preNode.properties.className = [];
              } else if (!Array.isArray(preNode.properties.className)) {
                preNode.properties.className = [String(preNode.properties.className)];
              }
              // Add the custom class
              (preNode.properties.className as (string | number)[]).push('force-ltr-code');
              // We can optionally still set dir, but CSS will be the primary method
              preNode.properties.dir = 'ltr';
            }
          });
        };


        const result = await serialize(rawSource, {
          parseFrontmatter: false, // Already parsed in server component
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              [rehypePrettyCode, prettyCodeOptions],
              rehypeAddCodeBlockClass // Add our custom plugin AFTER pretty-code
            ],
          },
        });
        setSerializedSource(result);
      } catch (error) {
        console.error("Error serializing MDX:", error);
        setSerializeError("Failed to render document content.");
      } finally {
        setIsSerializing(false);
      }
    }
    serializeMdx();
  }, [rawSource]); // Re-run if rawSource changes

  // Determine text direction and container variant based on props
  const textDirection = frontmatter.lang === 'he' ? 'rtl' : 'ltr';
  const containerVariant = 'bright';
  const proseClasses = containerVariant === 'bright' ? 'prose' : 'prose prose-invert';

  // Select background image
  const randomBgIndex = Math.floor(Math.random() * backgroundImages.length);
  const selectedBgImage = backgroundImages[randomBgIndex];

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen p-4 md:p-8 isolate"
      style={{
        backgroundImage: `url(${selectedBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 w-full h-full bg-black/60 -z-10"></div>

      {/* Main Content Area - Flexbox for two columns */}
      <div className="relative w-full max-w-7xl my-4 z-0 flex flex-row gap-4 h-[85vh]">

        {/* Left Column: MDX Content */}
        <Container
          variant={containerVariant}
          className="w-2/3 h-full overflow-y-auto relative"
        >
          <CopyButton
            textToCopy={rawSource} // Use rawSource for the copy button
            className="absolute top-4 right-4 z-10"
          />
          <article
            className={`${proseClasses} max-w-none lg:prose-xl p-4`}
            dir={textDirection}
          >
            {/* Conditionally render MDXRemote */}
            {isSerializing ? (
              <p>Loading content...</p>
            ) : serializeError ? (
              <p className="text-red-500">{serializeError}</p>
            ) : serializedSource ? (
              <MDXRemote
                {...serializedSource}
                components={mdxComponents}
              />
            ) : (
              <p>Could not load content.</p>
            )}
          </article>
        </Container>

        {/* Right Column: Chat Interface */}
        <div className="w-1/3 h-full flex flex-col">
           {isCharLoading ? ( // Use renamed state
             <Container variant="default" className="h-full flex items-center justify-center">
               Loading Chat...
             </Container>
           ) : charError ? ( // Use renamed state
             <Container variant="default" className="h-full flex items-center justify-center">
               {charError}
             </Container>
           ) : characterData ? (
             <ChatInterface
               character={characterData}
               showStarters={true}
               className="flex-grow"
               height="h-full"
               dir="rtl"
               initialContext={rawSource}
             />
           ) : (
             <Container variant="default" className="h-full flex items-center justify-center">
               Chat unavailable. Character data could not be loaded.
             </Container>
           )}
        </div>
      </div>
    </div>
  );
}
