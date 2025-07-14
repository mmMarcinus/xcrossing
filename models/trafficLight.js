export class TrafficLight {
  constructor(x, y, orientation = 'vertical') {
    this.x = x;
    this.y = y;
    this.width = 10
    this.height = 30
    this.orientation = orientation; // 'vertical' | 'horizontal'
    this.state = 'red'; // 'red' | 'green'
    this.isBlocked = false;
  }

  setState(state) {
    this.state = state;
  }

  toggle() {
    this.state = this.state === 'red' ? 'green' : 'red';
  }

  draw(ctx) {
    ctx.fillStyle = this.state === 'green' ? 'lime' : 'red';
    if (this.orientation == 'vertical') {
      ctx.fillRect(this.x, this.y, this.height, this.width);
    } else if (this.orientation == 'horizontal') {
      ctx.fillRect(this.x, this.y, this.width, this.height)
    }
    
  }
}