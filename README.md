# Exodus Narrative Game (Working Title)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Short Description

An interactive visual novel game built with Next.js and React, exploring the story of the Exodus from slavery to freedom, featuring integrated mini-games based on the narrative of "כיצד תספר" (How You Shall Tell).

## Overview

This project aims to bring the story of the Jewish Exodus from Egypt to life through an engaging, interactive visual novel experience. Based primarily on the narrative structure found in "כיצד תספר מעבדות לחירות", the game follows the journey of the Israelites from their initial honored status, through the hardships of slavery, and towards eventual redemption.

The game combines traditional visual novel elements (dialogue, choices, branching narrative points) with unique mini-games designed to reflect the challenges and themes of each stage of the story. It is developed with the goal of being an educational and thought-provoking experience for families and children, presented primarily in Hebrew.

## Features

* **Interactive Narrative:** Experience the Exodus story through dialogue, character interactions, and player choices.
* **Visual Novel Format:** Engaging presentation with character sprites (planned), backgrounds, and text.
* **Integrated Mini-Games:** Gameplay segments tied directly to the narrative stages:
    * **"השלם את הפסוק / הציווי" (Complete the Verse/Command):** A multiple-choice trivia game testing knowledge related to the story.
    * **"איסוף וארגון" (Collection and Organization):** A top-down game focused on gathering items while avoiding hazards.
    * **"ניהול משימות צוות יומי" (Daily Team Task Management):** A light RTS/resource management game where the player manages workers' tasks, needs, and resources to meet quotas under pressure.
    * *(Planned/Optional) "שמירה על התקווה" (Guarding Hope):* An adapted arcade shooter where players protect positive concepts while fighting negative ones.
* **Hebrew Language:** The primary language for the game's UI and content.
* **Adaptive Atmosphere:** Visuals and mini-game difficulty adjust to reflect the narrative stage (e.g., Honored Status vs. Hard Slavery).
* **(Optional Future Feature):** Potential integration of LLM-based chat for deeper character interaction.

## Technology Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **UI Library:** React
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Animation (Planned):** Anime.js
* **(Optional for Mini-Games):** HTML Canvas API or simple JS game libraries (e.g., Kaboom.js, Kontra.js)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-url]
    cd [repository-name]
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Mini-Game Details

* **Trivia Game:** Located at `/mini-games/trivia` (example path). Presents multiple-choice questions based on the current narrative context.
* **Collection Game:** Located at `/mini-games/collection` (example path). Player navigates a top-down area to collect items and avoid obstacles/hazards.
* **Task Management Game:** Located at `/mini-games/daily-task-manager`. Player manages individual workers (energy, hunger, morale) assigning them tasks to meet daily quotas within a time limit, managing shared resources.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

*(Optional: Add guidelines here if you want others to contribute. E.g., "Contributions are welcome! Please open an issue first to discuss what you would like to change.")*

## Acknowledgements

* Inspired by and based on the narrative structure presented in the text "כיצד תספר מעבדות לחירות" by Ariel Fox (אריאל פוקס).
