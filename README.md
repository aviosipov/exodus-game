# Exodus: An Interactive AI Adventure

Welcome to "Exodus: An Interactive AI Adventure" (Hebrew: יציאת מצרים: הרפתקה אינטראקטיבית)! This project is an interactive visual novel exploring the story of the Exodus from Egypt, inspired by the book "**How Will You Tell**" ("כיצד תספר") by **Rabbi Ariel Fux**.

## Project Vision

This project aims to blend the traditional narrative of the Exodus with innovative technology, specifically Artificial Intelligence (AI). Our goal is not just to retell the story but to allow users to *experience* it in an interactive, engaging, and thought-provoking way, bridging the past and the future.

## AI-Powered Development

**This project is a testament to the power of AI in modern software development. Approximately 99% of the code and a significant portion of the content were generated using cutting-edge AI tools.**

Our development process heavily relied on:

*   **Cline (VS Code Plugin):** Used extensively for code generation, refactoring, debugging, and implementing features across the stack (React components, Next.js logic, CSS, etc.).
*   **Google Gemini Pro:** Leveraged for generating the narrative content (adventure JSON files) and trivia questions based on source material and specific guidelines provided in MDX format.
*   **Midjourney:** Utilized for creating the visual assets, including character portraits and background images, following the process outlined in our [AI Image Generation Guide](/ai-docs/image-generation-guide.md).
*   **ChatGPT & Runway GenAI:** Employed for various tasks including brainstorming, content refinement, and potentially video generation.

This AI-centric approach allowed for rapid prototyping and development, exploring new ways to create interactive narrative experiences.

## Key Features

*   **Interactive Visual Novel:** Experience the Exodus story through text, character dialogues, background images, and player choices.
*   **Branching Narratives:** Make choices that influence the conversation and potentially the character's perspective.
*   **Mini-Games:** Engage with the story through integrated mini-games:
    *   Hebrew Trivia Quiz
    *   Daily Task Management (Resource Management)
    *   "Gathering and Organizing" (Collection Game)
    *   "Maintaining Hope" (Space Invaders Style Game)
*   **AI Character Chat (Optional):** Converse with key figures from the story, powered by AI, to explore their perspectives.
*   **Hebrew Language & RTL Support:** Fully localized in Hebrew with Right-to-Left layout.

## Technology Stack

*   **Framework:** Next.js (v15.3) / React (v19)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (v4)
*   **Animations:** Anime.js
*   **Content:** JSON for adventure and trivia data
*   **Documentation:** MDX

## Documentation

Comprehensive documentation (primarily in Hebrew) is available to help users understand, run, modify, and create content for the game:

**[➡️ Start Exploring the Documentation Here](/docs/index)**

The documentation covers:
*   Introduction and Project Background
*   Setup and Running Locally
*   Project Structure
*   Content Editing (Adventures, Trivia, Assets)
*   Mini-Games Overview
*   Basic Development Environment Setup
*   Troubleshooting

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended, e.g., v20)
*   npm (comes with Node.js)
*   Git (optional but recommended)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/[username]/exodus-game.git
    cd exodus-game
    ```
    (Replace `[username]` with the actual repository owner/path)
    *Alternatively, download and extract the ZIP file.*

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables (if necessary):**
    Copy the sample environment file:
    ```bash
    # Windows
    copy .env.local.sample .env.local
    # macOS/Linux
    cp .env.local.sample .env.local
    ```
    Edit `.env.local` if specific API keys or configurations are needed.

### Running the Development Server

1.  **Start the server:**
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to `http://localhost:3000`.

For more detailed instructions, see the [Setup and Running Locally Guide](/docs/setup-run).

## Contributing

*(Contribution guidelines can be added here if the project is open to contributions)*

## License

This project is licensed under the [LICENSE](LICENSE) file.

---

We hope you enjoy this unique exploration of the Exodus story, powered by AI!
