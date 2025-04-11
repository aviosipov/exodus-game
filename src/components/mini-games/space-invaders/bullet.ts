import * as Config from './config';

export class Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speed: number;
  active: boolean; // To mark for removal after collision or going off-screen

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.width = Config.BULLET_WIDTH;
    this.height = Config.BULLET_HEIGHT;
    this.color = Config.BULLET_COLOR;
    this.speed = Config.BULLET_SPEED; // Should be negative for upward movement
    this.active = true;
  }

  update(): void {
    if (!this.active) return;

    this.y += this.speed;

    // Deactivate if it goes off the top of the screen
    if (this.y + this.height < 0) {
      this.active = false;
    }
    // Note: TTL logic from original config is removed, handled by off-screen check or collision
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
