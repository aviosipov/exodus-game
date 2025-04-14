import fs from 'fs';
import path from 'path';

// Define character structure (remains the same)
export interface Character {
  id: string;
  name: string;
  imagePath: string;
  thumbPath: string;
  description: string;
  systemPrompt: string;
}

// Define the base path for characters relative to the project root
const charactersBasePath = path.join(process.cwd(), 'public', 'characters');

// Rewritten function to get character data by reading files
export const getCharacterById = (id: string): Character | undefined => {
  try {
    const characterDir = path.join(charactersBasePath, id);
    const infoPath = path.join(characterDir, 'info.json');
    const promptPath = path.join(characterDir, 'prompt.txt');

    // Check if directory and files exist
    if (!fs.existsSync(characterDir) || !fs.existsSync(infoPath) || !fs.existsSync(promptPath)) {
      console.warn(`Character files not found for id: ${id}`);
      return undefined;
    }

    // Read and parse info.json
    const infoContent = fs.readFileSync(infoPath, 'utf-8');
    const infoData = JSON.parse(infoContent);

    // Read prompt.txt
    const promptContent = fs.readFileSync(promptPath, 'utf-8');

    // Construct the Character object
    const character: Character = {
      id: id,
      name: infoData.name || 'Unknown Name', // Provide default if missing
      description: infoData.description || 'No description available.', // Provide default
      imagePath: `/characters/${id}/image.png`, // Construct path
      thumbPath: `/characters/${id}/thumb.png`, // Construct path
      systemPrompt: promptContent.trim(), // Use the content of prompt.txt
    };

    return character;

  } catch (error) {
    console.error(`Error reading character data for id ${id}:`, error);
    return undefined;
  }
};

// Optional: Function to get all character IDs (if needed elsewhere)
export const getAllCharacterIds = (): string[] => {
  try {
    if (!fs.existsSync(charactersBasePath)) {
      return [];
    }
    const directories = fs.readdirSync(charactersBasePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    return directories;
  } catch (error) {
    console.error("Error reading character directories:", error);
    return [];
  }
};
