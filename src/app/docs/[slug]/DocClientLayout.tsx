"use client";

// Removed unused useState, useEffect
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote"; // Keep MDXRemoteSerializeResult for prop type
import { mdxComponents } from "@/mdx-components";
import Container from "@/components/ui/Container";
import { CopyButton } from "@/components/ui/CopyButton";
import { ChatInterface, Character } from "@/components/chat/ChatInterface";
// Removed unused PrettyCodeOptions and Element types

// Define interface for expected frontmatter (can be reused or imported)
interface DocFrontmatter {
  lang?: string;
}

// Define the props the client component will receive
interface DocClientLayoutProps {
  serializedSource: MDXRemoteSerializeResult; // Expect serialized source object
  frontmatter: DocFrontmatter;
  devGuideCharacter: Character | null;
  rawSource: string; // Pass raw source separately for CopyButton
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
  serializedSource,
  frontmatter,
  devGuideCharacter,
  rawSource, // Receive raw source for copy button
  backgroundImages = defaultBackgroundImages
}: DocClientLayoutProps) {
  // Removed unused prettyCodeOptions variable

  // Determine text direction and container variant based on props
  const textDirection = frontmatter.lang === 'he' ? 'rtl' : 'ltr';
  const containerVariant = 'bright';
  const proseClasses = containerVariant === 'bright' ? 'prose' : 'prose prose-invert';

  // Select background image
  const randomBgIndex = Math.floor(Math.random() * backgroundImages.length);
  const selectedBgImage = backgroundImages[randomBgIndex];

  // No need for loading/error state here as data is fetched server-side
  // If devGuideCharacter is null, the chat interface will show a loading/error state internally or based on its implementation

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
            {/* MDXRemote now receives source directly */}
            {/* Note: MDXRemote might need serialized source if not using /rsc */}
            {/* Pass the serialized source object to MDXRemote */}
             <MDXRemote
              {...serializedSource} // Spread the serialized source object
              components={mdxComponents}
            />
          </article>
        </Container>

        {/* Right Column: Chat Interface */}
        <div className="w-1/3 h-full flex flex-col">
           {devGuideCharacter ? (
             <ChatInterface
               character={devGuideCharacter}
               showStarters={true}
               className="flex-grow"
               height="h-full"
               dir="rtl" // Pass rtl since Tomer uses Hebrew
             />
           ) : (
             <Container variant="default" className="h-full flex items-center justify-center">
               Chat unavailable. Character data missing.
             </Container>
           )}
        </div>
      </div>
    </div>
  );
}
