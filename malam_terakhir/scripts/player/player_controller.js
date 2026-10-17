
export class PlayerController {
  constructor(x = 100, y = 100) {
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.speed = 160;
    this.keys = {};
  }

  init() {
    window.addEventListener("keydown", (event) => {
      this.keys[event.key.toLowerCase()] = true;

      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "]
          .includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
      }
    });

    window.addEventListener("keyup", (event) => {
      this.keys[event.key.toLowerCase()] = false;
    });

    window.addEventListener("blur", () => {
      this.keys = {};
    });
  }

  update(deltaTime, walls = []) {
    let dx = 0;
    let dy = 0;

    if (this.keys["w"] || this.keys["arrowup"]) dy -= 1;
    if (this.keys["s"] || this.keys["arrowdown"]) dy += 1;
    if (this.keys["a"] || this.keys["arrowleft"]) dx -= 1;
    if (this.keys["d"] || this.keys["arrowright"]) dx += 1;

    const length = Math.hypot(dx, dy);

    if (length > 0) {
      dx /= length;
      dy /= length;
    }

    const distance = this.speed * deltaTime;
    const nextX = this.x + dx * distance;
    const nextY = this.y + dy * distance;

    if (!this.collides(nextX, this.y, walls)) {
      this.x = nextX;
    }

    if (!this.collides(this.x, nextY, walls)) {
      this.y = nextY;
    }
  }

  collides(x, y, walls) {
    return walls.some((wall) => {
      const closestX = Math.max(
        wall.x,
        Math.min(x, wall.x + wall.width)
      );

      const closestY = Math.max(
        wall.y,
        Math.min(y, wall.y + wall.height)
      );

      const dx = x - closestX;
      const dy = y - closestY;

      return dx * dx + dy * dy < this.radius * this.radius;
    });
  }

  draw(ctx) {
    ctx.save();

    // Bayangan pemain
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.ellipse(
      this.x,
      this.y + 5,
      this.radius,
      this.radius * 0.6,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Badan pemain
    ctx.fillStyle = "#d9e2dc";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Kepala / arah pandang sederhana
    ctx.fillStyle = "#8fa89a";
    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y - 3,
      this.radius * 0.55,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }
}
