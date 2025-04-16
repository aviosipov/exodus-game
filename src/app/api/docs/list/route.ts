import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

interface DocInfo {
  filename: string;
  title: string | null;
  description: string | null;
}

const contentDir = path.join(process.cwd(), "src", "content", "docs");

export async function GET() {
  try {
    const files = await fs.readdir(contentDir);
    const mdxFiles = files.filter(
      (file) => file.endsWith(".mdx") || file.endsWith(".md")
    );

    const docsData: DocInfo[] = await Promise.all(
      mdxFiles.map(async (filename) => {
        const filePath = path.join(contentDir, filename);
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const { data } = matter(fileContent); // Extract frontmatter

          // Ensure title and description are strings or null
          const title = typeof data.title === 'string' ? data.title : null;
          const description = typeof data.description === 'string' ? data.description : null;

          return {
            filename,
            title,
            description,
          };
        } catch (readError) {
          console.error(`Error reading or parsing frontmatter for ${filename}:`, readError);
          // Return basic info even if frontmatter parsing fails
          return {
            filename,
            title: null,
            description: null,
          };
        }
      })
    );

    return NextResponse.json(docsData);

  } catch (error) {
    console.error("Error listing docs:", error);
    // Check if the error is due to the directory not existing
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ error: "Content directory not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to list documents." }, { status: 500 });
  }
}
