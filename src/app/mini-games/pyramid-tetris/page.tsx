'use client';

import React, { useEffect } from 'react';

// Constants moved outside useEffect for component scope access
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    '#FF0D72', // Red
    '#0DC2FF', // Cyan
    '#0DFF72', // Green
    '#F538FF', // Purple
    '#FF8E0D', // Orange
    '#FFE138', // Yellow
    '#3877FF', // Blue
    '#ffd700', // Gold
    '#ff6b6b', // Coral
    '#8A2BE2', // BlueViolet
    '#00CED1', // DarkTurquoise
    '#FF1493'  // DeepPink
];


const PyramidTetrisPage = () => {
  useEffect(() => {
    // Constants are defined outside the hook

    // Game elements
    const gameBoard = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const tutorialElement = document.getElementById('tutorial');
    const tutorialButton = document.getElementById('tutorial-button');
    const nextPieceCanvas = document.getElementById('next-piece-canvas') as HTMLCanvasElement | null;
    const nextPieceCtx = nextPieceCanvas?.getContext('2d');
    const stabilityValueElement = document.getElementById('stability-value');
    const stabilityWarningElement = document.getElementById('stability-warning');
    const garbageZone = document.getElementById('garbage-zone');
    const garbageAnimation = document.getElementById('garbage-animation');
    const messagePopup = document.getElementById('message-popup');
    const helpButton = document.getElementById('help-button');

    // Ensure elements exist before proceeding
    if (!gameBoard || !scoreElement || !levelElement || !gameOverElement || !finalScoreElement || !startButton || !restartButton || !tutorialElement || !tutorialButton || !nextPieceCanvas || !nextPieceCtx || !stabilityValueElement || !stabilityWarningElement || !garbageZone || !garbageAnimation || !messagePopup || !helpButton) {
        console.error("One or more game elements not found!");
        return;
    }


    // Set canvas size
    nextPieceCanvas.width = 100;
    nextPieceCanvas.height = 100;

    // Game variables
    let board: number[][] = [];
    let blockSlots: { row: number; col: number; filled: boolean; level: number }[] = [];
    let currentPiece: { shape: number[][]; position: { x: number; y: number }; colorIndex: number } | null = null;
    let nextPiece: { shape: number[][]; position: { x: number; y: number }; colorIndex: number } | null = null;
    let score = 0;
    let level = 1;
    let stability = 100;
    let gameInterval: NodeJS.Timeout | null = null;
    let isPaused = false;
    let gameStarted = false;

    // Show message popup
    function showMessage(message: string, isGood: boolean) {
        // Hebrew message translations
        const translations: { [key: string]: string } = {
            "FITS!": "מתאים!",
            "WON'T FIT": "לא מתאים",
            "Perfect Fit! +100": "התאמה מושלמת! +100",
            "Misfit! -10 Stability": "חוסר התאמה! -10 יציבות",
            "Blocks shifted!": "בלוקים זזו!",
            "PAUSED": "מושהה",
            "RESUMED": "ממשיך",
            "Build a Pyramid!": "בנה פירמידה!",
            "Piece Discarded": "חלק הושלך",
            "Not enough points to discard!": "אין מספיק נקודות להשלכה!",
            "PYRAMID COMPLETE! +1000": "הפירמידה הושלמה! +1000",
            "Great Pyramid Shape! x2 Score": "צורת פירמידה מעולה! ניקוד x2",
            "PERFECT PYRAMID! x3 SCORE!": "פירמידה מושלמת! ניקוד x3!",
            "Good Placement!": "מיקום טוב!",
            "Poor Fit": "התאמה חלשה",
            "Place blocks in the highlighted slots!": "הנח בלוקים בחריצים המודגשים!"
        };

        // Translate the message if available
        const translatedMessage = translations[message] || message;

        if (messagePopup) {
            messagePopup.textContent = translatedMessage;
            messagePopup.className = 'message-popup ' + (isGood ? 'good' : 'bad');
            messagePopup.style.opacity = '1';

            setTimeout(() => {
                messagePopup.style.opacity = '0';
            }, 1500);
        }
    }

    // Custom block shapes
    const SHAPES = [
        // Traditional Tetris blocks
        [
            [1, 1, 0],
            [0, 1, 1]
        ],
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1]
        ],
        [
            [0, 1, 1],
            [1, 1, 0]
        ],
        [
            [0, 1, 0],
            [1, 1, 1]
        ],
        [
            [1, 0, 0],
            [1, 1, 1]
        ],
        [
            [1, 1],
            [1, 1]
        ],
        [
            [0, 0, 1],
            [1, 1, 1]
        ],

        // Pyramid-friendly custom blocks
        [
            [0, 1, 0],
            [1, 1, 1]
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 1]
        ],
        [
            [1]
        ],
        [
            [1, 1]
        ],
        [
            [1, 1, 1]
        ],
        [
            [0, 1, 0],
            [1, 0, 1]
        ],
        // Triangle
        [
            [0, 1, 0],
            [1, 1, 1]
        ],
        // Trapezoid
        [
            [0, 1, 1, 0],
            [1, 1, 1, 1]
        ],
        // Small triangle
        [
            [1],
            [1, 1]
        ],
        // Zig-zag
        [
            [1, 0],
            [1, 1],
            [0, 1]
        ]
    ];

    // Create block slots for the pyramid structure
    function createBlockSlots() {
        blockSlots = [];

        // Create a pyramid structure with slots
        // Starting with a wide base at the bottom, narrowing to the top
        const pyramidHeight = 14; // Height of the pyramid portion
        const baseRow = BOARD_HEIGHT - 3; // Row where the pyramid starts (leaving 3 rows at bottom for base)
        const pyramidWidth = 9; // Max width of pyramid at base

        // Generate the pyramid structure from bottom to top
        for (let level = 0; level < pyramidHeight; level++) {
            // Calculate width for this level (wider at bottom, narrower at top)
            const levelWidth = Math.max(1, Math.floor(pyramidWidth * (1 - level / pyramidHeight)));

            // Calculate starting column to center the level
            const startCol = Math.floor((BOARD_WIDTH - levelWidth) / 2);

            // Current row (start from base and go up)
            const row = baseRow - level;

            // Create slots for this level
            for (let col = startCol; col < startCol + levelWidth; col++) {
                if (col >= 0 && col < BOARD_WIDTH && row >= 0 && row < BOARD_HEIGHT) {
                    blockSlots.push({
                        row: row,
                        col: col,
                        filled: false,
                        level: level // Store the level (for physics validation)
                    });
                }
            }
        }

        // Create a solid base at the bottom
        const baseHeight = 3;
        const baseWidth = pyramidWidth + 2; // Make base wider than pyramid
        for (let row = BOARD_HEIGHT - baseHeight; row < BOARD_HEIGHT; row++) {
            for (let col = 0; col < BOARD_WIDTH; col++) {
                if (col >= Math.floor((BOARD_WIDTH - baseWidth) / 2) &&
                    col < Math.floor((BOARD_WIDTH - baseWidth) / 2) + baseWidth) {
                    // Add a solid base block
                    if (board[row]) { // Ensure row exists
                        board[row][col] = 8; // Gold color for base
                    }
                }
            }
        }

        // Render the block slots
        renderBlockSlots();

        // Create a visual outline of the pyramid shape to guide players
        createPyramidOutline();
    }

    // Create a visual outline of the pyramid shape
    function createPyramidOutline() {
        // Remove existing outline first
        const existingOutline = gameBoard?.querySelector('.pyramid-outline');
        if (existingOutline) {
            existingOutline.remove();
        }

        const outline = document.createElement('div');
        outline.className = 'pyramid-outline';
        outline.style.position = 'absolute';
        outline.style.top = '0';
        outline.style.left = '0';
        outline.style.width = '100%';
        outline.style.height = '100%';
        outline.style.pointerEvents = 'none'; // Make it non-interactive

        // Create SVG for the outline
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';

        // Find the outline points by looking at the slot positions
        const outlinePoints: { x: number; y: number }[] = [];

        // Group slots by row
        const slotsByRow: { [key: number]: { row: number; col: number }[] } = {};
        blockSlots.forEach(slot => {
            if (!slotsByRow[slot.row]) {
                slotsByRow[slot.row] = [];
            }
            slotsByRow[slot.row].push(slot);
        });

        // Get the min and max column for each row
        const rows = Object.keys(slotsByRow).map(Number).sort((a, b) => a - b); // Sort rows from top to bottom

        // Top point
        if (rows.length > 0) {
            const topRow = rows[0];
            const topCols = slotsByRow[topRow].map(slot => slot.col);
            const topMinCol = Math.min(...topCols);
            const topMaxCol = Math.max(...topCols);
            outlinePoints.push({ x: (topMinCol + (topMaxCol - topMinCol + 1) / 2) * BLOCK_SIZE, y: topRow * BLOCK_SIZE });
        }


        // Left side points (from top to bottom)
        for (const row of rows) {
            const cols = slotsByRow[row].map(slot => slot.col);
            const minCol = Math.min(...cols);
            outlinePoints.push({
                x: minCol * BLOCK_SIZE,
                y: (row + 1) * BLOCK_SIZE // Bottom edge of the row
            });
        }

        // Right side points (from bottom to top)
        for (const row of [...rows].reverse()) {
            const cols = slotsByRow[row].map(slot => slot.col);
            const maxCol = Math.max(...cols);
            outlinePoints.push({
                x: (maxCol + 1) * BLOCK_SIZE,
                y: (row + 1) * BLOCK_SIZE // Bottom edge of the row
            });
        }


        // Create path
        if (outlinePoints.length > 1) { // Need at least 2 points for a line
            let pathData = `M ${outlinePoints[0].x} ${outlinePoints[0].y} `;

            for (let i = 1; i < outlinePoints.length; i++) {
                pathData += `L ${outlinePoints[i].x} ${outlinePoints[i].y} `;
            }

            // Don't close the path for an outline
            // pathData += "Z";

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", pathData);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "rgba(255, 215, 0, 0.3)");
            path.setAttribute("stroke-width", "2");
            path.setAttribute("stroke-dasharray", "5,5");
            svg.appendChild(path);

            outline.appendChild(svg);
            gameBoard?.appendChild(outline);
        }
    }


    // Render the block slots
    function renderBlockSlots() {
        if (!gameBoard) return;
        // Clear existing slots
        const existingSlots = gameBoard.querySelectorAll('.block-slot');
        existingSlots.forEach(slot => slot.remove());

        // Render new slots
        blockSlots.forEach(slot => {
            if (!slot.filled) {
                const slotElement = document.createElement('div');
                slotElement.className = 'block-slot';
                slotElement.style.width = `${BLOCK_SIZE}px`;
                slotElement.style.height = `${BLOCK_SIZE}px`;
                slotElement.style.top = `${slot.row * BLOCK_SIZE}px`;
                slotElement.style.left = `${slot.col * BLOCK_SIZE}px`;
                gameBoard.appendChild(slotElement);
            }
        });
    }

    // Initialize board
    function initBoard() {
        board = Array.from({ length: BOARD_HEIGHT }, () =>
            Array.from({ length: BOARD_WIDTH }, () => 0)
        );

        // Create block slots for pyramid structure
        createBlockSlots(); // This also adds the base

        // Add guide animation for the first piece
        setTimeout(() => {
            if (gameStarted) {
                showMessage("Place blocks in the highlighted slots!", true);
                highlightNextValidSlots();
            }
        }, 1000);
    }

    // Highlight the next valid positions where pieces can be placed
    function highlightNextValidSlots() {
        if (!gameBoard) return;
        // Clear previous highlights
        const existingHighlights = gameBoard.querySelectorAll('.block-slot-highlight');
        existingHighlights.forEach(highlight => highlight.remove());

        // Find the unfilled slots that are properly supported
        const validSlots: { row: number; col: number }[] = [];

        for (const slot of blockSlots) {
            if (!slot.filled) {
                // Check if this slot is supported
                let isSupported = false;

                // Check if slot is at the bottom of the board (or on the base)
                if (slot.row >= BOARD_HEIGHT - 3) { // Adjusted for 3-row base
                    isSupported = true;
                }
                // Check if there's a filled block directly below
                else if (slot.row + 1 < BOARD_HEIGHT && board[slot.row + 1][slot.col] > 0) {
                    isSupported = true;
                }
                // Check diagonal support (needs both sides filled below)
                else if (slot.row + 1 < BOARD_HEIGHT &&
                         (slot.col > 0 && board[slot.row + 1][slot.col - 1] > 0) &&
                         (slot.col < BOARD_WIDTH - 1 && board[slot.row + 1][slot.col + 1] > 0)) {
                    isSupported = true;
                }

                if (isSupported) {
                    validSlots.push(slot);
                }
            }
        }

        // Highlight only the lowest valid slots in each column
        const lowestSlotByColumn: { [key: number]: { row: number; col: number } } = {};

        for (const slot of validSlots) {
            if (!lowestSlotByColumn[slot.col] || slot.row > lowestSlotByColumn[slot.col].row) {
                lowestSlotByColumn[slot.col] = slot;
            }
        }

        // Highlight these slots with a pulsating effect
        Object.values(lowestSlotByColumn).forEach(slot => {
            const highlight = document.createElement('div');
            highlight.className = 'block-slot-highlight';
            highlight.style.width = `${BLOCK_SIZE}px`;
            highlight.style.height = `${BLOCK_SIZE}px`;
            highlight.style.top = `${slot.row * BLOCK_SIZE}px`;
            highlight.style.left = `${slot.col * BLOCK_SIZE}px`;
            highlight.style.animation = 'pulse 1.5s infinite';
            gameBoard.appendChild(highlight);
        });
    }


    // Create and render game board
    function renderBoard() {
        if (!gameBoard) return;
        // Clear existing blocks but keep slots and outline
        const existingBlocks = gameBoard.querySelectorAll('.block, .ghost-block, .fit-indicator');
        existingBlocks.forEach(block => block.remove());

        // Render all cells
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            for (let col = 0; col < BOARD_WIDTH; col++) {
                if (board[row]?.[col]) { // Check if row and col exist
                    const block = document.createElement('div');
                    block.className = 'block';
                    block.style.width = `${BLOCK_SIZE}px`;
                    block.style.height = `${BLOCK_SIZE}px`;
                    block.style.top = `${row * BLOCK_SIZE}px`;
                    block.style.left = `${col * BLOCK_SIZE}px`;
                    block.style.backgroundColor = COLORS[board[row][col] - 1];
                    gameBoard.appendChild(block);
                }
            }
        }

        // Render ghost piece (preview of where piece will land)
        if (currentPiece) {
            renderGhostPiece();
            renderPiece();
        }

        // Update slot visibility based on filled state
        renderBlockSlots();

        // Update stability
        updateStabilityDisplay();
    }

    // Render the ghost piece (landing preview)
    function renderGhostPiece() {
        if (!currentPiece || !gameBoard) return;

        const ghostPiece = {
            shape: currentPiece.shape,
            position: { ...currentPiece.position },
            colorIndex: currentPiece.colorIndex
        };

        // Move ghost piece down until collision
        while (!checkCollision({
            shape: ghostPiece.shape,
            position: {
                x: ghostPiece.position.x,
                y: ghostPiece.position.y + 1
            }
        })) {
            ghostPiece.position.y++;
        }

        // Only render if it's not at the same position as the current piece
        if (ghostPiece.position.y > currentPiece.position.y) {
            const { shape, position } = ghostPiece;
            const willFit = checkPieceFit(ghostPiece);

            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row]?.[col]) { // Check row and col exist
                        const block = document.createElement('div');
                        block.className = 'ghost-block';
                        block.style.width = `${BLOCK_SIZE}px`;
                        block.style.height = `${BLOCK_SIZE}px`;
                        block.style.top = `${(position.y + row) * BLOCK_SIZE}px`;
                        block.style.left = `${(position.x + col) * BLOCK_SIZE}px`;
                        block.style.backgroundColor = willFit ? "#4CAF50" : "#FF5252";
                        block.style.opacity = willFit ? "0.3" : "0.2";
                        block.style.borderStyle = willFit ? "dashed" : "dotted";
                        gameBoard.appendChild(block);
                    }
                }
            }

            // Show fit indicator
            const indicatorText = willFit ? "FITS!" : "WON'T FIT";
            const indicatorClass = willFit ? "good" : "bad";
            // Calculate center of the ghost piece for indicator positioning
            let shapeWidth = 0;
            if (shape.length > 0 && shape[0]) {
                shapeWidth = shape[0].length;
            }
            const indicatorX = (position.x + shapeWidth / 2) * BLOCK_SIZE - 30; // Adjust offset
            const indicatorY = (position.y) * BLOCK_SIZE - 20; // Position above the ghost piece

            const indicator = document.createElement('div');
            indicator.className = `fit-indicator ${indicatorClass}`;
            // Translate indicator text
            const translations: { [key: string]: string } = { "FITS!": "מתאים!", "WON'T FIT": "לא מתאים" };
            indicator.textContent = translations[indicatorText] || indicatorText;
            indicator.style.left = `${indicatorX}px`;
            indicator.style.top = `${indicatorY}px`;
            indicator.style.opacity = '1'; // Make it visible initially
            gameBoard.appendChild(indicator);

            // Add fade-out animation via class or direct style manipulation if needed
             setTimeout(() => {
                 if (indicator.parentNode) { // Check if still attached
                     indicator.remove();
                 }
             }, 1500); // Match CSS animation duration
        }
    }


    // Render the current piece
    function renderPiece() {
        if (!currentPiece || !gameBoard) return;
        const { shape, position, colorIndex } = currentPiece;

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row]?.length; col++) { // Check row exists
                if (shape[row][col]) {
                    const block = document.createElement('div');
                    block.className = 'block';
                    block.style.width = `${BLOCK_SIZE}px`;
                    block.style.height = `${BLOCK_SIZE}px`;
                    block.style.top = `${(position.y + row) * BLOCK_SIZE}px`;
                    block.style.left = `${(position.x + col) * BLOCK_SIZE}px`;
                    block.style.backgroundColor = COLORS[colorIndex % COLORS.length]; // Use modulo for safety
                    gameBoard.appendChild(block);
                }
            }
        }
    }

    // Generate a new piece
    function generatePiece() {
        // Get valid pieces that would fit in the current structure
        const fittingPieces = findFittingPieces();
        // Increased chance to 80% (from 50%)
        const useSmartSelection = Math.random() < 0.8 || fittingPieces.length === 0;

        if (nextPiece) {
            currentPiece = nextPiece;
        } else {
            let shapeIndex;

            // For the first few pieces, use simpler shapes
            if (score < 100) {
                const easyShapes = [1, 5, 9, 10, 11]; // Indexes of simple, easy-to-place shapes
                shapeIndex = easyShapes[Math.floor(Math.random() * easyShapes.length)];
            }
            // Try to provide a fitting piece at least 80% of the time
            else if (fittingPieces.length > 0 && useSmartSelection) {
                // Select a random piece from the fitting pieces
                shapeIndex = fittingPieces[Math.floor(Math.random() * fittingPieces.length)];
            }
            // Otherwise, get a random piece
            else {
                shapeIndex = Math.floor(Math.random() * SHAPES.length);
            }

            const shape = SHAPES[shapeIndex];
            if (!shape || !shape[0]) { // Basic check for valid shape
                console.error("Invalid shape generated at index:", shapeIndex);
                shapeIndex = 5; // Fallback to square
            }

            currentPiece = {
                shape: SHAPES[shapeIndex],
                position: {
                    x: Math.floor(BOARD_WIDTH / 2) - Math.floor((SHAPES[shapeIndex][0]?.length || 1) / 2), // Safe access
                    y: 0
                },
                colorIndex: shapeIndex % COLORS.length
            };
        }

        // Generate next piece (also try to provide a fitting piece)
        const nextFittingPieces = findFittingPieces();
        // Increased chance to 80% (from 50%)
        const useSmartSelectionForNext = Math.random() < 0.8 || nextFittingPieces.length === 0;

        let nextShapeIndex;
        if (score < 200) {
            const easyShapes = [1, 5, 9, 10, 11]; // Indexes of simple, easy-to-place shapes
            nextShapeIndex = easyShapes[Math.floor(Math.random() * easyShapes.length)];
        }
        // Try to provide a fitting piece at least 80% of the time
        else if (nextFittingPieces.length > 0 && useSmartSelectionForNext) {
            nextShapeIndex = nextFittingPieces[Math.floor(Math.random() * nextFittingPieces.length)];
        }
        else {
            nextShapeIndex = Math.floor(Math.random() * SHAPES.length);
        }

        const nextShape = SHAPES[nextShapeIndex];
         if (!nextShape || !nextShape[0]) { // Basic check for valid shape
            console.error("Invalid next shape generated at index:", nextShapeIndex);
            nextShapeIndex = 5; // Fallback to square
        }


        nextPiece = {
            shape: SHAPES[nextShapeIndex],
            position: {
                x: Math.floor(BOARD_WIDTH / 2) - Math.floor((SHAPES[nextShapeIndex][0]?.length || 1) / 2), // Safe access
                y: 0
            },
            colorIndex: nextShapeIndex % COLORS.length
        };

        renderNextPiece();

        // Check if game is over (collision on spawn)
        if (currentPiece && checkCollision(currentPiece)) {
            gameOver();
        }
    }

    // Find pieces that would fit well in the current structure
    function findFittingPieces(): number[] {
        const fittingPieceIndices: number[] = [];

        // Find valid placement slots (unfilled and supported)
        const validSlots: { row: number; col: number }[] = [];
        for (const slot of blockSlots) {
            if (!slot.filled) {
                // Check if this slot is supported
                let isSupported = false;

                // Check if slot is at the bottom of the board (or on the base)
                if (slot.row >= BOARD_HEIGHT - 3) { // Adjusted for 3-row base
                    isSupported = true;
                }
                // Check if there's a filled block directly below
                else if (slot.row + 1 < BOARD_HEIGHT && board[slot.row + 1]?.[slot.col] > 0) {
                    isSupported = true;
                }
                // Check diagonal support (needs both sides filled below)
                else if (slot.row + 1 < BOARD_HEIGHT &&
                         (slot.col > 0 && board[slot.row + 1]?.[slot.col - 1] > 0) &&
                         (slot.col < BOARD_WIDTH - 1 && board[slot.row + 1]?.[slot.col + 1] > 0)) {
                    isSupported = true;
                }

                if (isSupported) {
                    validSlots.push(slot);
                }
            }
        }

        // If no valid slots, return simple shapes
        if (validSlots.length === 0) {
            return [1, 5, 9, 10, 11]; // I, O, single block, etc.
        }

        // Check each piece shape
        for (let i = 0; i < SHAPES.length; i++) {
            const shape = SHAPES[i];
            if (!shape || !shape[0]) continue; // Skip invalid shapes

            // Try placing the piece at each valid slot position
            for (const startSlot of validSlots) {
                // Try placing the piece with its bottom-left corner at the slot
                // (This is a simplification, a better approach would check all anchor points)
                const testPiece = {
                    shape: shape,
                    position: {
                        x: startSlot.col,
                        y: startSlot.row - (shape.length - 1) // Align bottom row of shape with slot row
                    },
                    colorIndex: i % COLORS.length
                };

                // Check if this placement is valid (no immediate collision)
                if (!checkCollision(testPiece)) {
                    // Check if the piece fits well when dropped from this position
                    if (checkPieceFit(testPiece)) {
                        fittingPieceIndices.push(i);
                        break; // Found a fit for this shape, move to the next shape
                    }
                }
            }
        }

        // If no fitting pieces found, include some simple shapes that are usually easier to place
        if (fittingPieceIndices.length === 0) {
            return [1, 5, 9, 10, 11]; // I, O, single block, etc.
        }

        // Remove duplicates and return
        return [...new Set(fittingPieceIndices)];
    }


    // Check if a piece fits into block slots
    function checkPieceFit(piece: { shape: number[][]; position: { x: number; y: number } }): boolean {
        const { shape, position } = piece;

        // Move the piece all the way down to find landing position
        const landingPos = { ...position }; // Use const, not reassigned
        while (!checkCollision({
            shape: shape,
            position: {
                x: landingPos.x,
                y: landingPos.y + 1
            }
        })) {
            landingPos.y++;
        }

        // Check if each cell of the piece lands on a valid slot and is supported
        let allCellsFit = true;
        let cellsOnSlots = 0;
        let totalCells = 0;

        // First, collect all the cells that would be occupied at the landing position
        const occupiedCells: { row: number; col: number }[] = [];
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row]?.length; col++) { // Safe access
                if (shape[row][col]) {
                    totalCells++;
                    const boardRow = landingPos.y + row;
                    const boardCol = landingPos.x + col;
                    // Ensure the cell is within board bounds before adding
                    if (boardRow >= 0 && boardRow < BOARD_HEIGHT && boardCol >= 0 && boardCol < BOARD_WIDTH) {
                        occupiedCells.push({ row: boardRow, col: boardCol });
                    } else {
                        // If any part lands outside the board, it doesn't fit
                        return false;
                    }
                }
            }
        }

        if (totalCells === 0) return false; // Empty shape doesn't fit

        // Create a temporary board representing the state *before* the piece lands
        const tempBoardBefore = board.map(row => [...row]);

        // Check if each occupied cell lands on an unfilled slot and has support *from the existing board*
        for (const cell of occupiedCells) {
            let onUnfilledSlot = false;
            let hasSupportFromBelow = false;

            // Check if it lands on an unfilled slot
            for (const slot of blockSlots) {
                if (slot.row === cell.row && slot.col === cell.col && !slot.filled) {
                    onUnfilledSlot = true;
                    break;
                }
            }

            // Check for support from the board *before* the piece lands
            // Support comes from:
            // 1. Being on the base (row >= BOARD_HEIGHT - 3)
            // 2. Having a filled block directly below it in tempBoardBefore
            // 3. Having diagonal support from two filled blocks below in tempBoardBefore

            if (cell.row >= BOARD_HEIGHT - 3) { // On the base
                hasSupportFromBelow = true;
            } else if (cell.row + 1 < BOARD_HEIGHT && tempBoardBefore[cell.row + 1]?.[cell.col] > 0) { // Direct support
                hasSupportFromBelow = true;
            } else if (cell.row + 1 < BOARD_HEIGHT &&
                       (cell.col > 0 && tempBoardBefore[cell.row + 1]?.[cell.col - 1] > 0) &&
                       (cell.col < BOARD_WIDTH - 1 && tempBoardBefore[cell.row + 1]?.[cell.col + 1] > 0)) { // Diagonal support
                hasSupportFromBelow = true;
            }

            if (onUnfilledSlot) {
                cellsOnSlots++;
            }

            // If any cell lands outside a slot OR lacks support from the existing structure, it's not a good fit
            if (!onUnfilledSlot || !hasSupportFromBelow) {
                allCellsFit = false;
                // Don't break early, we need cellsOnSlots count
            }
        }

        // A piece fits if *all* its cells land on *unfilled* slots AND *each* cell has support from the structure below it.
        return allCellsFit && cellsOnSlots === totalCells;
    }


    // Recursive function to check if a cell has proper support
    // Uses memoization to avoid checking the same cell multiple times
    function checkCellSupport(row: number, col: number, tempBoard: number[][], checkedCells: string[]): boolean {
        // Base case: off the board
        if (row < 0 || row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH) {
            return false;
        }

        // Base case: cell is empty
        if (tempBoard[row]?.[col] === 0) { // Safe access
            return false;
        }

        // Base case: already checked this cell
        const cellKey = `${row},${col}`;
        if (checkedCells.includes(cellKey)) {
            return true; // Assume support if we're in a cycle (shouldn't happen with gravity)
        }

        // Base case: at the bottom of the board (or on the base)
        if (row >= BOARD_HEIGHT - 3) { // Adjusted for 3-row base
            return true;
        }

        // Mark this cell as checked
        checkedCells.push(cellKey);

        // Check direct support below
        if (tempBoard[row + 1]?.[col] > 0) { // Safe access
            // Recursively check if the supporting block itself is supported
            if (checkCellSupport(row + 1, col, tempBoard, checkedCells)) {
                return true;
            }
        }

        // Check diagonal support (need two-point support)
        const leftSupportBlockExists = (col > 0 && tempBoard[row + 1]?.[col - 1] > 0); // Safe access
        const rightSupportBlockExists = (col < BOARD_WIDTH - 1 && tempBoard[row + 1]?.[col + 1] > 0); // Safe access

        if (leftSupportBlockExists && rightSupportBlockExists) {
            // Recursively check if *both* supporting diagonal blocks are themselves supported
            const leftIsSupported = checkCellSupport(row + 1, col - 1, tempBoard, [...checkedCells]); // Pass copy of checkedCells
            const rightIsSupported = checkCellSupport(row + 1, col + 1, tempBoard, [...checkedCells]); // Pass copy of checkedCells
            if (leftIsSupported && rightIsSupported) {
                return true;
            }
        }

        // If no support found
        return false;
    }


    // Render the next piece preview
    function renderNextPiece() {
        if (!nextPiece || !nextPieceCtx || !nextPieceCanvas) return;

        nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

        const { shape, colorIndex } = nextPiece;
        if (!shape || !shape[0]) return; // Check for valid shape

        const blockSize = 20; // Smaller blocks for preview
        const shapeWidth = shape[0].length;
        const shapeHeight = shape.length;
        const offsetX = (nextPieceCanvas.width - shapeWidth * blockSize) / 2;
        const offsetY = (nextPieceCanvas.height - shapeHeight * blockSize) / 2;

        for (let row = 0; row < shapeHeight; row++) {
            for (let col = 0; col < shapeWidth; col++) {
                if (shape[row]?.[col]) { // Safe access
                    nextPieceCtx.fillStyle = COLORS[colorIndex % COLORS.length]; // Use modulo
                    nextPieceCtx.fillRect(
                        offsetX + col * blockSize,
                        offsetY + row * blockSize,
                        blockSize,
                        blockSize
                    );
                    nextPieceCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    nextPieceCtx.strokeRect(
                        offsetX + col * blockSize,
                        offsetY + row * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            }
        }
    }

    // Check for collisions
    function checkCollision(piece: { shape: number[][]; position: { x: number; y: number } }): boolean {
        const { shape, position } = piece;

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row]?.length; col++) { // Safe access
                if (shape[row][col]) {
                    const newRow = position.y + row;
                    const newCol = position.x + col;

                    // Check boundaries
                    if (
                        newRow >= BOARD_HEIGHT ||
                        newCol < 0 ||
                        newCol >= BOARD_WIDTH ||
                        (newRow >= 0 && board[newRow]?.[newCol]) // Safe access to board
                    ) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // Move piece
    function movePiece(dx: number, dy: number): boolean {
        if (!currentPiece || isPaused || !gameStarted) return false;

        currentPiece.position.x += dx;
        currentPiece.position.y += dy;

        if (checkCollision(currentPiece)) {
            currentPiece.position.x -= dx;
            currentPiece.position.y -= dy;

            if (dy > 0) {
                // Piece has landed
                lockPiece();
                // checkStructure is called within lockPiece/applyPhysics
                generatePiece();
                highlightNextValidSlots(); // Highlight after new piece generated
            }

            return false;
        }

        renderBoard();
        return true;
    }

    // Rotate piece
    function rotatePiece() {
        if (!currentPiece || isPaused || !gameStarted) return false;

        const originalShape = currentPiece.shape;
        if (!originalShape || !originalShape[0]) return false; // Check valid shape

        // Create rotated shape (90 degrees clockwise)
        const numRows = originalShape.length;
        const numCols = originalShape[0].length;
        const rotatedShape: number[][] = Array.from({ length: numCols }, () => Array(numRows).fill(0));

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                rotatedShape[col][numRows - 1 - row] = originalShape[row][col];
            }
        }


        const originalPosition = { ...currentPiece.position };
        const originalShapeRef = currentPiece.shape; // Keep reference to revert
        currentPiece.shape = rotatedShape;

        // Wall kick attempts (simplified)
        const kicks = [
            { x: 0, y: 0 },   // Original position
            { x: -1, y: 0 },  // Try 1 cell left
            { x: 1, y: 0 },   // Try 1 cell right
            { x: 0, y: -1 },  // Try 1 cell up (less common but can help)
            { x: -2, y: 0 },  // Try 2 cells left
            { x: 2, y: 0 }    // Try 2 cells right
        ];

        let rotated = false;
        for (const kick of kicks) {
            currentPiece.position.x = originalPosition.x + kick.x;
            currentPiece.position.y = originalPosition.y + kick.y;

            if (!checkCollision(currentPiece)) {
                renderBoard();
                rotated = true;
                break; // Found a valid rotation
            }
        }

        // If no valid kick, revert rotation and position
        if (!rotated) {
            currentPiece.shape = originalShapeRef;
            currentPiece.position = originalPosition;
            return false;
        }

        return true;
    }

    // Send current piece to garbage
    function sendToGarbage() {
        if (!currentPiece || isPaused || !gameStarted) return;

        // Optional: Add cost to discard?
        // if (score < 50) {
        //     showMessage("Not enough points to discard!", false);
        //     return;
        // }
        // score -= 50;
        // if (scoreElement) scoreElement.textContent = score.toString();

        // Visual feedback
        showGarbageAnimation();

        // Generate new piece immediately
        generatePiece();
        renderBoard();
        highlightNextValidSlots();

        showMessage("Piece Discarded", false);
    }

    // Show garbage animation
    function showGarbageAnimation() {
        if (!garbageZone || !garbageAnimation) return;

        garbageZone.style.backgroundColor = '#4a4a4a'; // Darken briefly
        setTimeout(() => {
            garbageZone.style.backgroundColor = '#333';
        }, 200);

        // Create particles
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'garbage-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.width = `${10 + Math.random() * 20}px`;
            particle.style.height = particle.style.width; // Make it circular
            particle.style.backgroundColor = `rgba(255, 0, 0, ${0.2 + Math.random() * 0.3})`; // Varying red opacity
            garbageAnimation.appendChild(particle);

            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }

    // Lock the current piece in place
    function lockPiece() {
        if (!currentPiece) return;

        const { shape, position, colorIndex } = currentPiece;
        const willFit = checkPieceFit(currentPiece);

        // Place the piece on the board
        let cellsPlaced = 0;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row]?.length; col++) { // Safe access
                if (shape[row][col]) {
                    const boardRow = position.y + row;
                    const boardCol = position.x + col;

                    // Ensure placement is within bounds and on an empty cell
                    if (boardRow >= 0 && boardRow < BOARD_HEIGHT &&
                        boardCol >= 0 && boardCol < BOARD_WIDTH &&
                        !board[boardRow]?.[boardCol]) { // Safe access

                        board[boardRow][boardCol] = (colorIndex % COLORS.length) + 1; // Use modulo and +1
                        cellsPlaced++;

                        // Mark slot as filled if this is on a slot
                        for (let i = 0; i < blockSlots.length; i++) {
                            if (blockSlots[i].row === boardRow && blockSlots[i].col === boardCol) {
                                blockSlots[i].filled = true;
                                break; // Found the slot
                            }
                        }
                    } else {
                        // This part of the piece couldn't be placed (e.g., landed partially out of bounds or on another block)
                        // This scenario should ideally be prevented by checkCollision before lockPiece is called.
                        // If it happens, it might indicate an issue in collision detection or piece movement logic.
                        console.warn(`Could not place block at ${boardRow}, ${boardCol}`);
                    }
                }
            }
        }

        // Award points for placing the piece
        score += cellsPlaced * 5; // Base points per block placed

        // Check if the piece fits perfectly and award bonus/penalty
        if (willFit) {
            showMessage("Perfect Fit! +100", true);
            score += 100;
            stability = Math.min(100, stability + 5); // Smaller stability gain for good fit
        } else {
            showMessage("Misfit! -10 Stability", false);
            stability = Math.max(0, stability - 10); // Penalty for poor fit

            // Apply physics only if the piece didn't fit well
            applyPhysics(); // This might cause blocks to shift
        }

        // Update score display
        if (scoreElement) scoreElement.textContent = score.toString();

        // Check structure completion *after* potential physics adjustments
        checkStructure();

        // Clear current piece since it's locked
        currentPiece = null;
    }


    // Apply simplified physics for sliding blocks
    function applyPhysics() {
        // Start from the bottom, blocks can only slide down and to the sides
        let blocksMoved;
        let iterations = 0;
        const maxIterations = BOARD_HEIGHT * BOARD_WIDTH; // Generous limit

        do {
            blocksMoved = 0;

            // Create a copy of the board to check against original positions in the same pass
            const boardSnapshot = board.map(row => [...row]);

            // Check each block from bottom-up, left-to-right
            for (let row = BOARD_HEIGHT - 2; row >= 0; row--) {
                for (let col = 0; col < BOARD_WIDTH; col++) {
                    // Check the snapshot to see if a block *was* here at the start of the iteration
                    if (boardSnapshot[row]?.[col] > 0) { // Safe access
                        const colorIndex = boardSnapshot[row][col];

                        // Check if the current position in the *actual* board is now empty
                        // This handles cases where a block above might have already fallen into this spot
                        if (board[row]?.[col] === 0) continue;


                        // Check if the block is supported in its *current* position on the actual board
                        const isSupported = checkCellSupport(row, col, board, []); // Use the actual board

                        // If not supported, attempt to move it
                        if (!isSupported) {
                            // Try falling straight down first
                            if (row + 1 < BOARD_HEIGHT && board[row + 1]?.[col] === 0) { // Safe access
                                board[row + 1][col] = colorIndex;
                                board[row][col] = 0;
                                blocksMoved++;
                                updateSlotStatus(row, col, row + 1, col);
                                continue; // Move to next cell check after successful move
                            }

                            // Try sliding diagonally down-left or down-right
                            const canSlideLeft = row + 1 < BOARD_HEIGHT && col > 0 &&
                                                 board[row]?.[col - 1] === 0 && // Space to the side is clear
                                                 board[row + 1]?.[col - 1] === 0; // Space diagonally below is clear
                            const canSlideRight = row + 1 < BOARD_HEIGHT && col < BOARD_WIDTH - 1 &&
                                                  board[row]?.[col + 1] === 0 && // Space to the side is clear
                                                  board[row + 1]?.[col + 1] === 0; // Space diagonally below is clear

                            let slideDirection = 0;
                            if (canSlideLeft && canSlideRight) {
                                slideDirection = Math.random() < 0.5 ? -1 : 1; // Randomly pick if both possible
                            } else if (canSlideLeft) {
                                slideDirection = -1;
                            } else if (canSlideRight) {
                                slideDirection = 1;
                            }

                            if (slideDirection !== 0) {
                                const newCol = col + slideDirection;
                                board[row + 1][newCol] = colorIndex;
                                board[row][col] = 0;
                                blocksMoved++;
                                updateSlotStatus(row, col, row + 1, newCol);
                                continue; // Move to next cell check
                            }
                        }
                    }
                }
            }

            iterations++;
        } while (blocksMoved > 0 && iterations < maxIterations);

        if (blocksMoved > 0) {
            showMessage("Blocks shifted!", false);
            stability = Math.max(0, stability - 5 * blocksMoved); // Larger penalty if many blocks move
            renderBoard(); // Re-render after physics settle
        }

        if (iterations >= maxIterations) {
            console.warn("Physics simulation reached max iterations.");
        }

        // Highlight valid slots after blocks have settled
        highlightNextValidSlots();
    }

    // Helper to update slot filled status during physics
    function updateSlotStatus(oldRow: number, oldCol: number, newRow: number, newCol: number) {
        for (let i = 0; i < blockSlots.length; i++) {
            if (blockSlots[i].row === oldRow && blockSlots[i].col === oldCol) {
                blockSlots[i].filled = false;
            }
            if (blockSlots[i].row === newRow && blockSlots[i].col === newCol) {
                blockSlots[i].filled = true;
            }
        }
    }


    // Check the structure for scoring and update game state
    function checkStructure() {
        let numFilledSlots = 0;
        const totalSlots = blockSlots.length; // Use const

        if (totalSlots === 0) return; // Avoid division by zero if slots aren't initialized

        // Count filled slots
        for (const slot of blockSlots) {
            if (slot.filled) {
                numFilledSlots++;
            }
        }

        // Calculate completion percentage - Removed as it's unused
        // const completionPercentage = Math.floor((numFilledSlots / totalSlots) * 100);

        // Check if all slots are filled (pyramid complete)
        if (numFilledSlots === totalSlots) {
            // Show elaborate celebration
            showPyramidCompleteAnimation();

            showMessage("PYRAMID COMPLETE! +1000", true);
            score += 1000;

            // Increase level and reset for a new pyramid
            level++;
            if (levelElement) levelElement.textContent = level.toString();
            // Reset board, stability, etc.
            setTimeout(() => { // Delay reset slightly to allow animation to show
                 initBoard(); // Re-initializes board and slots
                 stability = 100;
                 updateStabilityDisplay();
                 renderBoard(); // Render the fresh board
                 generatePiece(); // Generate the first piece for the new level
                 highlightNextValidSlots();
                 adjustGameSpeed(); // Adjust speed for the new level
            }, 1500); // Adjust delay as needed
        } else {
             // Update score display if pyramid not complete
             if (scoreElement) scoreElement.textContent = score.toString();
             // Adjust game speed based on current level if needed (might already be handled elsewhere)
             // adjustGameSpeed();
        }
    }


    // Show celebration animation when pyramid is complete
    function showPyramidCompleteAnimation() {
        if (!gameBoard) return;
        // Create an overlay for the celebration
        const celebration = document.createElement('div');
        celebration.className = 'pyramid-complete-celebration'; // Use a specific class
        celebration.style.position = 'absolute';
        celebration.style.top = '0';
        celebration.style.left = '0';
        celebration.style.width = '100%';
        celebration.style.height = '100%';
        celebration.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        celebration.style.display = 'flex';
        celebration.style.justifyContent = 'center';
        celebration.style.alignItems = 'center';
        celebration.style.flexDirection = 'column';
        celebration.style.zIndex = '50';
        celebration.style.opacity = '0'; // Start hidden
        celebration.style.animation = 'fadeIn 0.5s forwards';

        // Add message (in Hebrew)
        const message = document.createElement('div');
        message.textContent = 'הפירמידה הושלמה!';
        message.style.color = 'gold';
        message.style.fontSize = '32px';
        message.style.fontWeight = 'bold';
        message.style.marginBottom = '20px';
        message.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.8)';
        message.style.transform = 'scale(0.5)'; // Start small
        message.style.opacity = '0';
        message.style.animation = 'scaleIn 0.5s 0.2s forwards';

        // Add level up message (in Hebrew)
        const levelMessage = document.createElement('div');
        levelMessage.textContent = `עלית לשלב! ← ${level + 1}`; // Show the *next* level
        levelMessage.style.color = 'white';
        levelMessage.style.fontSize = '24px';
        levelMessage.style.marginBottom = '20px';
        levelMessage.style.opacity = '0';
        levelMessage.style.animation = 'fadeIn 0.5s 0.5s forwards';


        // Add score bonus message (in Hebrew)
        const bonusMessage = document.createElement('div');
        bonusMessage.textContent = '+1000 נקודות';
        bonusMessage.style.color = '#4CAF50';
        bonusMessage.style.fontSize = '28px';
        bonusMessage.style.fontWeight = 'bold';
        bonusMessage.style.opacity = '0';
        bonusMessage.style.animation = 'fadeIn 0.5s 0.8s forwards';


        // Add fireworks particles
        const particleContainer = document.createElement('div');
        particleContainer.style.position = 'absolute';
        particleContainer.style.width = '100%';
        particleContainer.style.height = '100%';
        particleContainer.style.overflow = 'hidden'; // Contain particles
        particleContainer.style.pointerEvents = 'none';

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'celebration-particle';
            particle.style.position = 'absolute';
            particle.style.width = `${4 + Math.random() * 6}px`; // Smaller particles
            particle.style.height = particle.style.width;
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, ${60 + Math.random() * 20}%)`; // Brighter colors
            particle.style.boxShadow = `0 0 5px ${particle.style.backgroundColor}`;

            // Random position and animation
            const startX = Math.random() * gameBoard.clientWidth; // Start from random points
            const startY = Math.random() * gameBoard.clientHeight;
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100; // Shorter bursts
            const endX = startX + Math.cos(angle) * distance;
            const endY = startY + Math.sin(angle) * distance;

            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            particle.style.transform = 'scale(0)';
            particle.style.opacity = '1';

            // Create and apply the animation
            particle.style.animation = `
                firework ${0.5 + Math.random() * 0.5}s ${Math.random() * 0.5}s forwards ease-out
            `;

            // Set the custom property for the end position relative to start
            particle.style.setProperty('--delta-x', `${endX - startX}px`);
            particle.style.setProperty('--delta-y', `${endY - startY}px`);

            particleContainer.appendChild(particle);
        }

        // Add all elements to the celebration
        celebration.appendChild(particleContainer); // Particles behind text
        celebration.appendChild(message);
        celebration.appendChild(levelMessage);
        celebration.appendChild(bonusMessage);


        // Add to game board
        gameBoard.appendChild(celebration);

        // Remove after 3 seconds
        setTimeout(() => {
            celebration.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => {
                celebration.remove();
            }, 500);
        }, 3000);

        // Add animations to style if not already present
        if (!document.getElementById('celebration-styles')) {
            const style = document.createElement('style');
            style.id = 'celebration-styles';
            style.textContent = `
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
                @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes firework {
                    0% { transform: scale(0); opacity: 1; }
                    70% { transform: translate(var(--delta-x), var(--delta-y)) scale(1); opacity: 1; }
                    100% { transform: translate(var(--delta-x), var(--delta-y)) scale(0); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Update stability display
    function updateStabilityDisplay() {
        if (!stabilityValueElement || !stabilityWarningElement) return;

        stabilityValueElement.style.width = `${stability}%`;

        // Color based on stability
        if (stability < 30) {
            stabilityValueElement.style.backgroundColor = '#FF5252'; // Red
            stabilityWarningElement.style.display = 'block';
        } else if (stability < 70) {
            stabilityValueElement.style.backgroundColor = '#FFC107'; // Yellow
            stabilityWarningElement.style.display = 'none';
        } else {
            stabilityValueElement.style.backgroundColor = '#4CAF50'; // Green
            stabilityWarningElement.style.display = 'none';
        }
    }

    // Adjust game speed based on level
    function adjustGameSpeed() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
        // Speed increases more gradually
        const speed = Math.max(150, 1000 - (level * 50)); // Slower increase per level

        if (gameStarted && !isPaused) {
            gameInterval = setInterval(() => {
                movePiece(0, 1);
            }, speed);
        }
    }

    // Handle key presses
    function handleKeyPress(event: KeyboardEvent) {
        if (!gameStarted && event.key !== 'Enter' && event.key !== ' ') return; // Allow starting with Enter/Space maybe?
        if (!currentPiece && event.key !== 'p' && event.key !== 'P' && event.key !== 'h' && event.key !== 'H') return; // Don't process movement if no piece

        if (isPaused) {
            if (event.key === 'p' || event.key === 'P') {
                togglePause();
            }
            return;
        }

        switch (event.key) {
            case 'ArrowLeft':
                movePiece(-1, 0);
                break;
            case 'ArrowRight':
                movePiece(1, 0);
                break;
            case 'ArrowDown':
                movePiece(0, 1);
                // Optional: Add score for soft drop
                // score += 1;
                // if (scoreElement) scoreElement.textContent = score.toString();
                break;
            case 'ArrowUp':
                rotatePiece();
                break;
            case ' ': // Spacebar
                // Hard drop
                while (movePiece(0, 1)) {
                     // Optional: Add score for hard drop based on distance
                     // score += 2;
                }
                // Score is updated in lockPiece/checkStructure
                // if (scoreElement) scoreElement.textContent = score.toString();
                break;
            case 'g':
            case 'G':
                // Send to garbage
                sendToGarbage();
                break;
            case 'p':
            case 'P':
                togglePause();
                break;
            case 'h':
            case 'H':
                // Show help
                showHelp();
                break;
        }
    }

    // Show help overlay
    function showHelp() {
        if (!tutorialElement || !tutorialButton) return;

        // Pause the game if it's running
        if (gameStarted && !isPaused) {
            isPaused = true;
            if (gameInterval) clearInterval(gameInterval);
            gameInterval = null;
            showMessage("PAUSED", true); // Show pause message
        }


        tutorialElement.style.display = 'flex';

        // Change button text based on whether game was running
        if (gameStarted) {
            tutorialButton.textContent = 'המשך משחק'; // Resume Game
            tutorialButton.onclick = function() {
                tutorialElement.style.display = 'none';
                // Resume only if it was paused by help
                if (isPaused) {
                     togglePause(); // This will resume and show message
                }
            };
        } else {
             tutorialButton.textContent = 'התחל לשחק'; // Start Playing
             tutorialButton.onclick = function() {
                 tutorialElement.style.display = 'none';
                 startGame();
             };
        }
    }


    // Toggle pause
    function togglePause() {
        if (!gameStarted) return; // Can't pause if not started

        isPaused = !isPaused;

        if (isPaused) {
            if (gameInterval) clearInterval(gameInterval);
            gameInterval = null;
            showMessage("PAUSED", true);
        } else {
            adjustGameSpeed(); // Restart the game loop
            showMessage("RESUMED", true);
        }
    }

    // Game over
    function gameOver() {
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = null;
        gameStarted = false;
        currentPiece = null; // Stop controlling piece
        if (finalScoreElement) finalScoreElement.textContent = score.toString();
        if (gameOverElement) gameOverElement.style.visibility = 'visible';
        console.log("Game Over! Final Score:", score);
    }

    // Start game
    function startGame() {
        console.log("Starting game...");
        // Clear any previous game interval
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = null;

        initBoard(); // Resets board and slots
        renderBoard(); // Render the initial empty board with base and slots
        score = 0;
        level = 1;
        stability = 100;
        if (scoreElement) scoreElement.textContent = score.toString();
        if (levelElement) levelElement.textContent = level.toString();
        if (gameOverElement) gameOverElement.style.visibility = 'hidden';
        if (tutorialElement) tutorialElement.style.display = 'none'; // Hide tutorial if it was open
        updateStabilityDisplay(); // Show initial stability

        gameStarted = true;
        isPaused = false;

        generatePiece(); // Generate first piece and next piece
        renderBoard(); // Render board with the first piece
        highlightNextValidSlots(); // Highlight initial valid slots
        adjustGameSpeed(); // Start the game loop

        showMessage("Build a Pyramid!", true);
    }

    // --- Event Listeners Setup ---
    const startHandler = () => startGame();
    const restartHandler = () => startGame();
    const tutorialHandler = () => {
        if (tutorialElement) tutorialElement.style.display = 'none';
        startGame();
    };
    const keydownHandler = (event: KeyboardEvent) => handleKeyPress(event);
    const helpHandler = () => showHelp();

    startButton?.addEventListener('click', startHandler);
    restartButton?.addEventListener('click', restartHandler);
    tutorialButton?.addEventListener('click', tutorialHandler);
    document.addEventListener('keydown', keydownHandler);
    helpButton?.addEventListener('click', helpHandler);

    // --- Initial Setup ---
    initBoard();
    renderBoard(); // Render the initial state (base, slots)

    // --- Cleanup Function ---
    return () => {
      console.log("Cleaning up Pyramid Tetris listeners and interval");
      if (gameInterval) {
        clearInterval(gameInterval);
      }
      document.removeEventListener('keydown', keydownHandler);
      startButton?.removeEventListener('click', startHandler);
      restartButton?.removeEventListener('click', restartHandler);
      tutorialButton?.removeEventListener('click', tutorialHandler);
      helpButton?.removeEventListener('click', helpHandler);
      // Clear the board visually if needed, although component unmount should handle it
      if(gameBoard) gameBoard.innerHTML = '';
    };

  }, []); // Empty dependency array ensures this runs only once on mount

  // JSX structure matching the provided HTML
  return (
    <>
      <style>{`
        /* Paste all the CSS styles here */
        body {
            margin: 0;
            padding: 0;
            /* background-color: #121212; */ /* Let parent control background */
            color: white;
            font-family: 'Arial', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh; /* Use min-height */
            overflow: hidden;
        }

        .game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px; /* Add some padding */
            background-color: #121212; /* Container background */
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }

        .game-header {
            margin-bottom: 20px;
            text-align: center;
        }

        .game-title {
            font-size: 32px;
            margin-bottom: 10px;
            color: gold;
        }

        .game-subtitle {
            color: #aaa;
            max-width: 600px;
            text-align: center;
            margin-bottom: 15px;
        }

        .game-info {
            display: flex;
            flex-wrap: wrap; /* Allow wrapping on smaller screens */
            justify-content: center; /* Center items when wrapped */
            gap: 20px; /* Reduced gap */
            margin-bottom: 20px;
        }

        .score-container, .next-piece, .level-container, .stability-container {
            background-color: #222;
            padding: 10px 15px; /* Adjusted padding */
            border-radius: 5px;
            text-align: center;
            min-width: 100px; /* Minimum width */
        }

        /* .stability-container {
            display: flex;
            flex-direction: column;
            align-items: center;
        } */

        .stability-meter {
            width: 80px;
            height: 20px;
            background-color: #333;
            margin-top: 5px;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            margin-left: auto; /* Center within its container */
            margin-right: auto;
        }

        .stability-value {
            height: 100%;
            width: 100%; /* Start full */
            background-color: #4CAF50;
            transition: width 0.3s, background-color 0.3s;
        }

        .main-area {
            display: flex;
            flex-wrap: wrap; /* Allow wrapping */
            justify-content: center; /* Center items */
            gap: 20px;
        }

        .play-area {
            display: flex;
            flex-direction: column;
            gap: 10px;
            position: relative; /* Needed for absolute positioning inside */
        }

        #game-board {
            width: ${BOARD_WIDTH * BLOCK_SIZE}px; /* Dynamic width */
            height: ${BOARD_HEIGHT * BLOCK_SIZE}px; /* Dynamic height */
            border: 2px solid #444;
            background-color: #000;
            position: relative;
            overflow: hidden;
        }

        .block-slot {
            position: absolute;
            box-sizing: border-box;
            border: 1px dashed rgba(255, 215, 0, 0.3);
            background-color: rgba(255, 215, 0, 0.05);
            pointer-events: none; /* Don't interfere with clicks */
        }

        .block-slot-highlight {
            position: absolute;
            box-sizing: border-box;
            border: 2px dashed rgba(255, 215, 0, 0.7);
            background-color: rgba(255, 215, 0, 0.15);
            z-index: 5;
            pointer-events: none;
        }

        @keyframes pulse {
            0% { opacity: 0.3; background-color: rgba(255, 215, 0, 0.15); border-color: rgba(255, 215, 0, 0.7);}
            50% { opacity: 0.8; background-color: rgba(255, 215, 0, 0.3); border-color: rgba(255, 215, 0, 1.0);}
            100% { opacity: 0.3; background-color: rgba(255, 215, 0, 0.15); border-color: rgba(255, 215, 0, 0.7);}
        }

        .block {
            position: absolute;
            box-sizing: border-box;
            border: 1px solid rgba(0, 0, 0, 0.3); /* Darker border for better contrast */
            box-shadow: inset 0 0 3px rgba(255,255,255,0.3); /* Inner glow */
        }

        .ghost-block {
            position: absolute;
            box-sizing: border-box;
            /* border: 1px dashed rgba(255, 255, 255, 0.4); */ /* Use background instead */
            opacity: 0.3;
            z-index: 1; /* Below active piece */
        }

        .controls {
            background-color: #222;
            padding: 15px; /* Adjusted padding */
            border-radius: 5px;
            width: 200px;
            align-self: flex-start; /* Align to top when wrapped */
        }

        .controls h3 {
            text-align: center;
            margin-top: 0;
            margin-bottom: 15px; /* Added margin */
        }

        .controls p {
            margin: 10px 0;
            font-size: 14px; /* Slightly smaller font */
        }

        .key {
            background-color: #444;
            padding: 2px 8px;
            border-radius: 3px;
            font-family: monospace;
            display: inline-block; /* Ensure proper spacing */
            min-width: 20px; /* Minimum width for keys */
            text-align: center;
            margin: 0 2px; /* Spacing around keys */
        }

        .garbage-zone {
            width: ${BOARD_WIDTH * BLOCK_SIZE}px; /* Match board width */
            height: 80px; /* Reduced height */
            background-color: #333;
            border: 2px dashed #666;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            margin-top: 10px; /* Space above garbage zone */
        }

        .garbage-zone-title {
            font-size: 16px;
            color: #aaa;
            margin-bottom: 5px;
            position: relative;
            z-index: 2;
        }

        .garbage-zone-hint {
            font-size: 12px;
            color: #777;
            position: relative;
            z-index: 2;
        }

        .garbage-animation {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 1;
            pointer-events: none;
        }

        .garbage-particle {
            position: absolute;
            background-color: rgba(255, 0, 0, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: particle-fade 1s ease-out forwards;
        }

        @keyframes particle-fade {
            0% { transform: scale(0); opacity: 0.7; }
            100% { transform: scale(1.5); opacity: 0; } /* Grow slightly larger */
        }

        .game-over {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10;
            visibility: hidden; /* Use visibility */
            opacity: 0; /* Control with opacity for transition */
            transition: visibility 0s linear 0.3s, opacity 0.3s ease-in-out;
        }
        .game-over[style*="visible"] { /* Style when visible */
             visibility: visible;
             opacity: 1;
             transition-delay: 0s;
        }


        .game-over h2 {
            color: red;
            font-size: 36px;
            margin-bottom: 20px;
        }

        .tutorial {
            position: fixed; /* Use fixed to overlay everything */
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            display: none; /* Initially hidden */
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 20;
            text-align: center;
            padding: 20px; /* Padding for content */
            box-sizing: border-box;
        }
        .tutorial[style*="flex"] { /* Style when displayed */
             display: flex;
        }


        .tutorial h2 {
            color: gold;
            margin-bottom: 20px;
        }

        .tutorial p {
            margin-bottom: 15px;
            max-width: 500px;
            line-height: 1.5; /* Improve readability */
        }

        button {
            background-color: gold;
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.1s;
            margin-top: 10px; /* Add margin to buttons */
        }

        button:hover {
            background-color: #e6c300; /* Darker gold on hover */
        }
        button:active {
            transform: scale(0.95); /* Click effect */
        }


        #next-piece-canvas {
            width: 100px;
            height: 100px;
            background-color: #000;
            margin: 10px auto 0;
            border: 1px solid #444; /* Add border */
        }

        .message-popup {
            position: absolute;
            /* Position relative to game board */
            top: 40%; /* Adjust vertical position */
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px; /* Adjusted padding */
            border-radius: 10px;
            text-align: center;
            font-size: 20px; /* Adjusted font size */
            z-index: 100;
            opacity: 0;
            transition: opacity 0.5s, transform 0.5s;
            pointer-events: none; /* Don't block interaction */
            min-width: 150px; /* Ensure minimum width */
        }
        .message-popup[style*="opacity: 1"] { /* Style when visible */
             transform: translate(-50%, -60%); /* Move up slightly when visible */
        }


        .message-popup.good {
            color: #4CAF50;
            text-shadow: 0 0 5px #4CAF50;
        }

        .message-popup.bad {
            color: #FF5252;
            text-shadow: 0 0 5px #FF5252;
        }

        .stability-warning {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: rgba(255, 0, 0, 0.7);
            color: white;
            padding: 5px 10px; /* Smaller padding */
            border-radius: 5px;
            z-index: 5;
            display: none; /* Initially hidden */
            font-size: 12px; /* Smaller font */
        }
        .stability-warning[style*="block"] { /* Style when displayed */
             display: block;
        }


        .fit-indicator {
            position: absolute;
            font-weight: bold;
            font-size: 12px; /* Smaller font */
            padding: 2px 6px; /* Smaller padding */
            border-radius: 3px;
            z-index: 6; /* Above ghost blocks */
            opacity: 0; /* Start hidden */
            animation: fade-out 1.5s forwards ease-out;
            pointer-events: none;
        }

        .fit-indicator.good {
            background-color: rgba(76, 175, 80, 0.8); /* More opaque */
            color: white;
        }

        .fit-indicator.bad {
            background-color: rgba(255, 82, 82, 0.8); /* More opaque */
            color: white;
        }

        @keyframes fade-out {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }

        .help-button {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: rgba(255, 255, 255, 0.2); /* Lighter background */
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            z-index: 5;
            border: 1px solid rgba(255,255,255,0.4);
            transition: background-color 0.2s;
        }
        .help-button:hover {
            background-color: rgba(255, 255, 255, 0.4);
        }


        /* RTL Support */
        [dir="rtl"] .controls p {
            text-align: right;
        }

        [dir="rtl"] .help-button {
            left: 10px;
            right: auto;
        }

        [dir="rtl"] .stability-warning {
            right: 10px;
            left: auto;
        }

        /* Fix for RTL game board - we want the actual game mechanics to remain LTR */
        [dir="rtl"] #game-board,
        [dir="rtl"] .play-area,
        [dir="rtl"] .garbage-zone {
            direction: ltr;
        }
        [dir="rtl"] .controls {
             direction: rtl; /* Ensure controls text is RTL */
        }
        [dir="rtl"] .fit-indicator {
             direction: rtl; /* Ensure indicator text is RTL */
        }
        [dir="rtl"] .message-popup {
             direction: rtl; /* Ensure popup text is RTL */
        }

        /* Pyramid Outline Style */
        .pyramid-outline {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0; /* Behind everything */
        }

      `}</style>
      <div className="game-container" dir="rtl">
        <div className="game-header">
            <h1 className="game-title">פירמידה טטריס</h1>
            <p className="game-subtitle">בנה פירמידה על ידי התאמת בלוקים לחריצים המיועדים. השלך בלוקים לא רצויים לאזור האשפה.</p>
        </div>

        <div className="game-info">
            <div className="score-container">
                <h3>ניקוד</h3>
                <div id="score">0</div>
            </div>

            <div className="next-piece">
                <h3>הבא</h3>
                <canvas id="next-piece-canvas"></canvas>
            </div>

            <div className="level-container">
                <h3>שלב</h3>
                <div id="level">1</div>
            </div>

            <div className="stability-container">
                <h3>יציבות</h3>
                <div className="stability-meter">
                    <div className="stability-value" id="stability-value"></div>
                </div>
            </div>
        </div>

        <div className="main-area">
            <div className="play-area">
                <div id="game-board">
                    {/* Game board content is generated by script */}
                    <div className="stability-warning" id="stability-warning">
                        מבנה לא יציב!
                    </div>
                    <div className="help-button" id="help-button">?</div>
                </div>
                <div className="garbage-zone" id="garbage-zone">
                    <div className="garbage-zone-title">אזור אשפה</div>
                    <div className="garbage-zone-hint">לחץ על G כדי להשליך בלוק</div>
                    <div className="garbage-animation" id="garbage-animation"></div>
                </div>
            </div>

            <div className="controls">
                <h3>שליטה</h3>
                <p><span className="key">←</span> <span className="key">→</span> זוז שמאלה/ימינה</p>
                <p><span className="key">↑</span> סובב</p>
                <p><span className="key">↓</span> הפלה איטית</p>
                <p><span className="key">Space</span> הפלה מהירה</p>
                <p><span className="key">G</span> השלך לאשפה</p>
                <p><span className="key">P</span> השהה</p>
                <p><span className="key">H</span> הצג עזרה</p>
                <button id="start-button">התחל משחק</button>
            </div>
        </div>

        <div id="game-over" className="game-over">
            <h2>המשחק נגמר</h2>
            <p>הניקוד שלך: <span id="final-score">0</span></p>
            <button id="restart-button">שחק שוב</button>
        </div>

        <div id="tutorial" className="tutorial" style={{ display: 'flex' }}> {/* Start with tutorial visible */}
            <h2>ברוכים הבאים לפירמידה טטריס!</h2>
            <p>המטרה שלך היא לבנות <strong>פירמידה</strong> על ידי התאמת בלוקים לחריצים המיועדים.</p>
            <p>בלוקים יכולים <strong>להתאים</strong> או <strong>לא להתאים</strong> למיקומים מסוימים. בלוקים שאינם מתאימים עלולים להחליק!</p>
            <p>אם בלוק אינו שימושי, תוכל להשליך אותו ל<strong>אזור האשפה</strong> על ידי לחיצה על <span className="key">G</span>.</p>
            <p>הוספנו <strong>בסיס מוצק</strong> כדי להתחיל את הפירמידה שלך, והבלוקים הראשונים יהיו צורות פשוטות יותר כדי לעזור לך להתחיל.</p>
            <p>חפש את <strong>החריצים המודגשים</strong> המראים היכן להניח בלוקים הבאים!</p>
            <button id="tutorial-button">התחל לשחק</button>
        </div>

        <div id="message-popup" className="message-popup"></div>
      </div>
    </>
  );
};

export default PyramidTetrisPage;
