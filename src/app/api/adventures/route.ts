import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface AdventureInfo {
    id: string;
    title: string;
    description: string;
    voiceOver?: boolean; // Add optional voiceOver flag
}

export async function GET() {
    const adventuresDir = path.join(process.cwd(), 'src', 'data', 'adventures');
    let adventureFiles: string[];

    try {
        adventureFiles = fs.readdirSync(adventuresDir).filter(file => file.endsWith('.json'));
    } catch (error) {
        console.error("Error reading adventures directory:", error);
        return NextResponse.json({ error: 'Failed to read adventures directory' }, { status: 500 });
    }

    const adventures: AdventureInfo[] = [];

    for (const file of adventureFiles) {
        const filePath = path.join(adventuresDir, file);
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const jsonData = JSON.parse(fileContent);
            const adventureId = file.replace('.json', ''); // Use filename without extension as ID

            if (jsonData.title && jsonData.description) {
                adventures.push({
                    id: adventureId,
                    title: jsonData.title,
                    description: jsonData.description,
                    voiceOver: jsonData.voiceOver === true // Explicitly check for true
                });
            } else {
                console.warn(`File ${file} is missing title or description.`);
            }
        } catch (error) {
            console.error(`Error reading or parsing file ${file}:`, error);
            // Optionally skip this file or return an error
        }
    }

    // Optional: Sort adventures alphabetically by title or ID if needed
    adventures.sort((a, b) => a.title.localeCompare(b.title)); // Example sort by title

    return NextResponse.json(adventures);
}
