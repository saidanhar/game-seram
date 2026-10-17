
export class FlashlightController {
  constructor() {
    this.enabled = true;
    this.radius = 150;
    this.toggleKey = "f";
    this.onToggle = null;
  }

  init() {
    window.addEventListener("keydown", (event) => {
      if (
        event.key.toLowerCase() === this.toggleKey &&
        !event.repeat
      ) {
        this.enabled = !this.enabled;

        if (this.onToggle) {
          this.onToggle(this.enabled);
        }
      }
    });
  }

  draw(ctx, player, canvas) {
    if (this.enabled) return;

    // Saat senter mati, layar menjadi gelap.
    ctx.save();

    ctx.fillStyle = "rgba(0, 0, 0, 0.94)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sedikit cahaya agar posisi pemain masih terlihat.
    const gradient = ctx.createRadialGradient(
      player.x,
      player.y,
      8,
      player.x,
      player.y,
      55
    );

    gradient.addColorStop(0, "rgba(80, 90, 75, 0.3)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
  }
}
