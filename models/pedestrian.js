export class Pedestrian {
  constructor(x, y, direction = 'right', speed = 1, color = 'white', canvasSize = 800) {
    this.x          = x;
    this.y          = y;
    this.width      = 10;
    this.height     = 10;
    this.direction  = direction;
    this.speed      = speed;
    this.color      = color;
    this.canvasSize = canvasSize;
  }

  update(pedestrianLights) {
    if (this.shouldStopAtRedLight(pedestrianLights)) return;

    switch (this.direction) {
      case 'up':    this.y -= this.speed; break;
      case 'down':  this.y += this.speed; break;
      case 'left':  this.x -= this.speed; break;
      case 'right': this.x += this.speed; break;
    }
  }

  shouldStopAtRedLight(pedestrianLights) {
    const CROSSWALK_WIDTH = 10;
    const ROAD_WIDTH      = this.canvasSize / 4;
    const center          = this.canvasSize / 2;
    const halfRW          = ROAD_WIDTH / 2;

    const key   = { down: 'top', up: 'bottom', left: 'right', right: 'left' }[this.direction];
    const light = pedestrianLights[key];

    if (light.state === 'green') return false;

    let threshold;
    switch (this.direction) {
      case 'down':
        threshold = center - halfRW - CROSSWALK_WIDTH * 2;
        if (this.y + this.height >= threshold + CROSSWALK_WIDTH * 2) return false;
        if (this.y + this.height >= threshold) return false;
        return this.y + this.height + this.speed >= threshold;

      case 'up':
        threshold = center + halfRW + CROSSWALK_WIDTH;
        if (this.y <= threshold - CROSSWALK_WIDTH * 2) return false;
        if (this.y <= threshold) return false;
        return this.y - this.speed <= threshold;

      case 'left':
        threshold = center + halfRW + CROSSWALK_WIDTH;
        if (this.x <= threshold - CROSSWALK_WIDTH * 2) return false;
        if (this.x <= threshold) return false;
        return this.x - this.speed <= threshold;

      case 'right':
        threshold = center - halfRW - CROSSWALK_WIDTH * 2;
        if (this.x + this.width >= threshold + CROSSWALK_WIDTH * 2) return false;
        if (this.x + this.width >= threshold) return false;
        return this.x + this.width + this.speed >= threshold;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
