import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Load .env.local

import fs from "fs";
import path from "path";
import OpenAI from "openai";

// Ensure the API key is set in environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is not set.");
  process.exit(1);
}

const openai = new OpenAI();

const ADVENTURES_DIR = path.resolve("src/data/adventures");
const OUTPUT_DIR_BASE = path.resolve("public/audio/adventures");
const VOICE = "alloy"; // You can change the voice here if needed
const MODEL = "gpt-4o-mini-tts"; // Using the newer model
const NARRATION_INSTRUCTIONS = `
Voice: Clear, engaging, and slightly formal, suitable for storytelling.
Pacing: Moderate speed, allowing listeners to follow the narrative easily.
Emphasis: Place natural emphasis on key words and character names.
Tone: Maintain a tone appropriate for an adventure story, adjusting slightly based on the speaker (e.g., narrator vs. character).
`; // Instructions to guide the TTS voice

async function generateSpeech(text, outputFile) {
  try {
    console.log(`Generating speech for: ${outputFile}`);
    const mp3 = await openai.audio.speech.create({
      model: MODEL,
      voice: VOICE,
      input: text,
      instructions: NARRATION_INSTRUCTIONS, // Add instructions here
      response_format: "mp3",
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(outputFile, buffer);
    console.log(`Successfully saved: ${outputFile}`);
  } catch (error) {
    console.error(`Error generating speech for ${outputFile}:`, error);
    // Decide if you want to stop the script on error or continue
    // process.exit(1);
  }
}

async function processAdventure(episodeName) {
  const inputFile = path.join(ADVENTURES_DIR, `${episodeName}.json`);
  const outputDir = path.join(OUTPUT_DIR_BASE, episodeName);

  // 1. Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Adventure file not found at ${inputFile}`);
    process.exit(1);
  }

  // 2. Create output directory if it doesn't exist
  try {
    await fs.promises.mkdir(outputDir, { recursive: true });
    console.log(`Ensured output directory exists: ${outputDir}`);
  } catch (error) {
    console.error(`Error creating output directory ${outputDir}:`, error);
    process.exit(1);
  }

  // 3. Read and parse the adventure JSON
  let adventureData;
  try {
    const fileContent = await fs.promises.readFile(inputFile, "utf-8");
    adventureData = JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading or parsing adventure file ${inputFile}:`, error);
    process.exit(1);
  }

  // 4. Process scenes and choices
  if (!adventureData.scenes || !Array.isArray(adventureData.scenes)) {
     console.error(`Error: Invalid adventure format. Missing "scenes" array in ${inputFile}`);
     process.exit(1);
  }

  const generationPromises = [];

  adventureData.scenes.forEach((scene, sceneIndex) => {
    const sceneId = scene.id || `scene_${sceneIndex}`; // Use ID or index

    // Generate speech for scene text
    if (scene.text && typeof scene.text === 'string' && scene.text.trim() !== '') {
      const sceneOutputFile = path.join(outputDir, `${episodeName}.${sceneId}.mp3`);
      generationPromises.push(generateSpeech(scene.text, sceneOutputFile));
    }

    // Generate speech for choices text
    if (scene.choices && Array.isArray(scene.choices)) {
      scene.choices.forEach((choice, choiceIndex) => {
        if (choice.text && typeof choice.text === 'string' && choice.text.trim() !== '') {
          const choiceOutputFile = path.join(outputDir, `${episodeName}.${sceneId}.choice_${choiceIndex}.mp3`);
          generationPromises.push(generateSpeech(choice.text, choiceOutputFile));
        }
      });
    }
  });

  // 5. Wait for all speech generation to complete
  await Promise.all(generationPromises);
  console.log(`\nFinished processing adventure: ${episodeName}`);
}

// --- Main Execution ---
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: node scripts/generate-voiceover.js <episode_name>");
  console.error("Example: node scripts/generate-voiceover.js days_of_honor");
  process.exit(1);
}

const episodeName = args[0];
processAdventure(episodeName);
