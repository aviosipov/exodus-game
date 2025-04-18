"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
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
import { ChatInterface, Character, ChatInterfaceHandle } from "@/components/chat/ChatInterface"; // Import ChatInterfaceHandle

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
  const [selectedBgImage, setSelectedBgImage] = useState<string | null>(null); // State for background image

  // State for document search flow
  const [isSearchingDocs, setIsSearchingDocs] = useState(false);
  const [foundDocName, setFoundDocName] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false); // Track if search has run

  // Router and Search Params
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatRef = useRef<ChatInterfaceHandle>(null);

  // State for mobile view toggle
  const [mobileView, setMobileView] = useState<'chat' | 'doc'>('chat');

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

  // Effect to handle initial query after navigation, ensuring character is loaded
  useEffect(() => {
    const initialQuery = searchParams.get('initialQuery');
    // Only proceed if we have an initial query, the chat ref, AND character data is loaded
    if (initialQuery && chatRef.current && characterData && !isCharLoading) {
      console.log("Initial query found and character loaded, sending to chat:", initialQuery);
      // Use timeout to ensure chat UI is fully settled after state updates
      setTimeout(() => {
         if (chatRef.current) {
            chatRef.current.sendMessage(initialQuery);
            // Clean the URL - replace state to avoid adding to history
            const currentPath = window.location.pathname; // Get current path without query params
            router.replace(currentPath, { scroll: false }); // Use replace to remove query param
         }
      }, 100); // Keep small delay for UI updates
    }
    // Depend on searchParams AND characterData/isCharLoading to ensure readiness
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, characterData, isCharLoading]);

  // Effect to select background image only on client mount
  useEffect(() => {
    const randomBgIndex = Math.floor(Math.random() * backgroundImages.length);
    setSelectedBgImage(backgroundImages[randomBgIndex]);
  }, [backgroundImages]); // Re-run if backgroundImages prop changes (though unlikely here)

  // Function to handle the first message logic
  const handleBeforeSendMessage = async (messageContent: string): Promise<boolean> => {
    // Reset search hints if a new search is starting
    setFoundDocName(null);
    setSearchError(null);

    if (hasSearched) {
      return true; // Allow subsequent messages without searching again
    }

    setHasSearched(true); // Mark search as attempted for this session
    setIsSearchingDocs(true);

    try {
      // 1. Get list of docs
      const listRes = await fetch('/api/docs/list');
      if (!listRes.ok) {
        throw new Error(`Failed to fetch doc list: ${listRes.statusText}`);
      }
      const documents = await listRes.json();

      // 2. Find relevant doc
      const findRes = await fetch('/api/docs/find-relevant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: messageContent, documents }),
      });
      if (!findRes.ok) {
        const errorBody = await findRes.json().catch(() => ({ error: findRes.statusText }));
        throw new Error(`Failed to find relevant doc: ${errorBody.error || findRes.statusText}`);
      }
      const { filename } = await findRes.json();

      setIsSearchingDocs(false);

      if (filename && typeof filename === 'string') {
        setFoundDocName(filename);
        const slug = filename.replace(/\.mdx?$/, "");
        // Navigate with the original query
        router.push(`/docs/${slug}?initialQuery=${encodeURIComponent(messageContent)}`);
        return false; // Prevent current chat from processing this message
      } else {
        // No relevant doc found, proceed with current chat
        return true;
      }
    } catch (error) {
      console.error("Error during doc search:", error);
      setSearchError(error instanceof Error ? error.message : "An unknown error occurred during search.");
      setIsSearchingDocs(false);
      return true; // Allow chat to proceed on error
    }
  };

  // Function to reset search state when chat is cleared
  const handleChatCleared = () => {
    console.log("Chat cleared, resetting hasSearched state.");
    setHasSearched(false); // Reset the flag
    // Clear any lingering search hints
    setIsSearchingDocs(false);
    setFoundDocName(null);
    setSearchError(null);
  };

  // Determine text direction and container variant based on props
  const textDirection = frontmatter.lang === 'he' ? 'rtl' : 'ltr';
  const containerVariant = 'bright';
  const proseClasses = containerVariant === 'bright' ? 'prose' : 'prose prose-invert';

  // Background style object - only apply image when state is set
  const backgroundStyle = selectedBgImage ? {
    backgroundImage: `url(${selectedBgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  } : {}; // Empty object if no image selected yet

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen p-4 md:p-8 isolate"
      style={backgroundStyle} // Apply the conditional style
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 w-full h-full bg-black/60 -z-10"></div>

      {/* Main Content Area - Use flex-col for mobile, md:flex-row for desktop */}
      <div className="relative w-full max-w-7xl my-4 z-0 flex flex-col md:flex-row gap-4 h-[85vh]">

        {/* Mobile View Toggle Buttons (Only visible below md breakpoint) */}
        {/* eslint-disable react/no-unescaped-entities */}
        <div className="md:hidden flex justify-center gap-4 mb-4">
          <button
            onClick={() => setMobileView('chat')}
            className={`px-4 py-2 rounded ${mobileView === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            הצג צ'אט
          </button>
          <button
            onClick={() => setMobileView('doc')}
            className={`px-4 py-2 rounded ${mobileView === 'doc' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            הצג מסמך
          </button>
        </div>
        {/* eslint-enable react/no-unescaped-entities */}

        {/* Left Column: MDX Content - Conditional visibility and width */}
        <Container
          variant={containerVariant}
          // Full width on mobile if 'doc' is selected, hidden otherwise. Half width on desktop.
          className={`
            ${mobileView === 'doc' ? 'flex' : 'hidden'} md:flex
            w-full md:w-1/2 h-full overflow-y-auto relative flex-col
          `}
         >
           <CopyButton
             textToCopy={rawSource}
             // Conditionally set position based on text direction
             className={`absolute top-4 z-10 ${textDirection === 'rtl' ? 'left-4' : 'right-4'}`}
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

        {/* Right Column: Chat Interface - Conditional visibility and width */}
        {/* Full width on mobile if 'chat' is selected, hidden otherwise. Half width on desktop. */}
        <div className={`
          ${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex
          w-full md:w-1/2 h-full flex-col
        `}>
           {isCharLoading ? (
             <Container variant="default" className="h-full flex items-center justify-center">
               Loading Chat...
             </Container>
           ) : charError ? (
             <Container variant="default" className="h-full flex items-center justify-center">
               {charError}
             </Container>
           ) : characterData ? (
             <>
               {/* UI Hints Area */}
               <div className="text-center text-sm text-gray-400 mb-2 h-6">
                 {isSearchingDocs && <span>בודק את התיעוד שלנו...</span>}
                 {foundDocName && <span>מצאתי את המסמך הרלוונטי: {foundDocName}. מנווט לשם...</span>}
                 {searchError && <span className="text-red-400">שגיאה בחיפוש: {searchError}</span>}
               </div>
               <ChatInterface
                 ref={chatRef} // Add ref
                 character={characterData}
                 showStarters={true}
                 onBeforeSendMessage={handleBeforeSendMessage} // Add message interceptor
                 onChatCleared={handleChatCleared} // Pass the clear handler
                 className="flex-grow"
                 height="h-[calc(100%-2rem)]" // Adjust height for hints
                 dir="rtl"
                 initialContext={rawSource}
               />
             </>
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
