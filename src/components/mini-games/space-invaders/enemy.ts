import * as Config from './config';

export type BoxType = 'positive' | 'negative';

export class Box {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  type: BoxType;
  color: string;
  speed: number;
  active: boolean; // To mark for removal

  constructor(x: number, y: number, text: string, type: BoxType, speed: number) {
    this.x = x;
    this.y = y;
    this.width = Config.BOX_WIDTH;
    this.height = Config.BOX_HEIGHT;
    this.text = text;
    this.type = type;
    this.color = type === 'positive' ? Config.POSITIVE_BOX_COLOR : Config.NEGATIVE_BOX_COLOR;
    this.speed = speed;
    this.active = true; // Start as active
  }

  update(): void {
    this.y += this.speed;
    // Deactivate if it goes off-screen (can be handled in gameLogic too)
    if (this.y > Config.CANVAS_HEIGHT) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    // Draw the box
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw the text inside the box
    ctx.fillStyle = Config.TEXT_COLOR;
    ctx.font = Config.TEXT_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Adjust text position to be centered within the box
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
  }
}

// Helper function to create a new random box at the top
export function createRandomBox(): Box {
    const type: BoxType = Math.random() < Config.POSITIVE_BOX_RATIO ? 'positive' : 'negative';
    const wordList = type === 'positive' ? Config.POSITIVE_WORDS : Config.NEGATIVE_WORDS;
    const text = wordList[Math.floor(Math.random() * wordList.length)];
    const x = Math.random() * (Config.CANVAS_WIDTH - Config.BOX_WIDTH); // Random horizontal position
    const y = 0 - Config.BOX_HEIGHT; // Start just above the canvas
    const speed = Config.BOX_DESCENT_SPEED; // Use base speed from config

    return new Box(x, y, text, type, speed);
}
