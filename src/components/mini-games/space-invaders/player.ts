import * as Config from './config';
import { Bullet } from './bullet'; // Import Bullet for the shoot method

export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speed: number;

  constructor() {
    this.width = Config.PLAYER_WIDTH;
    this.height = Config.PLAYER_HEIGHT;
    this.x = Config.CANVAS_WIDTH / 2 - this.width / 2; // Center horizontally
    this.y = Config.PLAYER_Y_POSITION;
    this.color = Config.PLAYER_COLOR;
    this.speed = Config.PLAYER_SPEED;
  }

  update(moveLeft: boolean, moveRight: boolean): void {
    if (moveLeft) {
      this.x -= this.speed;
    }
    if (moveRight) {
      this.x += this.speed;
    }

    // Keep player within bounds
    if (this.x < 0) {
      this.x = 0;
    } else if (this.x > Config.CANVAS_WIDTH - this.width) {
      this.x = Config.CANVAS_WIDTH - this.width;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  shoot(): Bullet {
    // Calculate bullet starting position (centered above the player)
    const bulletX = this.x + this.width / 2 - Config.BULLET_WIDTH / 2;
    const bulletY = this.y; // Start at the top edge of the player
    return new Bullet(bulletX, bulletY);
  }
}
