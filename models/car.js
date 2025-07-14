export class Car {
  constructor(x, y, direction = 'down', turnDirection = 'straight', speed = 2, color = 'red', canvasSize = 800) {
    this.x             = x;
    this.y             = y;
    this.width         = 20;
    this.height        = 40;
    this.direction     = direction;
    this.turnDirection = turnDirection;
    this.hasTurned     = false;
    this.speed         = speed;
    this.defaultSpeed  = speed;
    this.color         = color;
    this.canvasSize    = canvasSize;
  }

  update(trafficLights, pedestrianLights, cars, pedestrians) {
    const center = this.canvasSize / 2;

    if (this.shouldStopForCarAhead(cars))     return;
    if (this.shouldStopAtRedLight(trafficLights)) return;

    // leting pedestrains go first
    if (!this.hasTurned && this.turnDirection !== 'straight') {
      const turnPedMap = {
        down:  { left: 'right',  right: 'left'  },
        up:    { left: 'left',   right: 'right' },
        left:  { left: 'bottom', right: 'top'   },
        right: { left: 'top',    right: 'bottom'}
      };

      let atTurnZone = false;
      switch (this.direction) {
        case 'down':
          atTurnZone = (this.turnDirection === 'left'  && this.y >= center + 50)
                    || (this.turnDirection === 'right' && this.y >= center - 50);
          break;
        case 'up':
          atTurnZone = (this.turnDirection === 'left'  && this.y <= center - 50)
                    || (this.turnDirection === 'right' && this.y <= center + 10);
          break;
        case 'left':
          atTurnZone = (this.turnDirection === 'left'  && this.x <= center - 50)
                    || (this.turnDirection === 'right' && this.x <= center + 30);
          break;
        case 'right':
          atTurnZone = (this.turnDirection === 'left'  && this.x <= center - 50)
                    || (this.turnDirection === 'right' && this.x >= center - 50);
          break;
      }

      if (atTurnZone) {
        const pedKey    = turnPedMap[this.direction][this.turnDirection];
        const pedLight  = pedestrianLights[pedKey];

        if (pedLight.state === 'green'
         && this.isPedestrianOnCrosswalk(pedKey, pedestrians)) {
          return;
        }
      }
    }

    if (!this.hasTurned) {
      this.handleTurn(center);
    }

    switch (this.direction) {
      case 'down':  this.y += this.speed; break;
      case 'up':    this.y -= this.speed; break;
      case 'left':  this.x -= this.speed; break;
      case 'right': this.x += this.speed; break;
    }
  }

  handleTurn(center) {
    switch (this.direction) {
      case 'down':
        if (this.turnDirection === 'left'  && this.y >= center + 50) this.turn();
        if (this.turnDirection === 'right' && this.y >= center - 50) this.turn();
        if (this.turnDirection === 'straight' && this.y >= center) this.turn();
        break;
      case 'up':
        if (this.turnDirection === 'left'  && this.y <= center - 50) this.turn();
        if (this.turnDirection === 'right' && this.y <= center + 10) this.turn();
        if (this.turnDirection === 'straight' && this.y <= center) this.turn();
        break;
      case 'left':
        if (this.turnDirection === 'left'  && this.x <= center - 50) this.turn();
        if (this.turnDirection === 'right' && this.x <= center + 30) this.turn();
        if (this.turnDirection === 'straight' && this.x <= center) this.turn();
        break;
      case 'right':
        if (this.turnDirection === 'left'  && this.x <= center - 50) this.turn();
        if (this.turnDirection === 'right' && this.x >= center - 50) this.turn();
        if (this.turnDirection === 'straight' && this.x >= center) this.turn();
        break;
    }
  }

  shouldStopForCarAhead(cars) {
    const SAFE_DISTANCE = 40;

    for (let other of cars) {
      if (other === this)                   continue;
      if (other.direction !== this.direction) continue;

      switch (this.direction) {
        case 'down':
          if (Math.abs(other.x - this.x) < this.width
           && other.y > this.y
           && (other.y - (this.y + this.height)) < SAFE_DISTANCE) {
            return true;
          }
          break;
        case 'up':
          if (Math.abs(other.x - this.x) < this.width
           && other.y < this.y
           && (this.y - (other.y + other.height)) < SAFE_DISTANCE) {
            return true;
          }
          break;
        case 'left':
          if (Math.abs(other.y - this.y) < this.width
           && other.x < this.x
           && (this.x - (other.x + other.width)) < SAFE_DISTANCE) {
            return true;
          }
          break;
        case 'right':
          if (Math.abs(other.y - this.y) < this.width
           && other.x > this.x
           && (other.x - (this.x + this.width)) < SAFE_DISTANCE) {
            return true;
          }
          break;
      }
    }

    return false;
  }

  shouldStopAtRedLight(trafficLights) {
    const STOP_BUFFER = 150;
    const center      = this.canvasSize / 2;

    if (this.hasTurned) return false;

    for (let light of trafficLights) {
      const relevant =
        (['down','up'].includes(this.direction)   && light.orientation === 'vertical')
     || (['left','right'].includes(this.direction) && light.orientation === 'horizontal');
      if (!relevant) continue;

      if (light.state === 'red') {
        switch (this.direction) {
          case 'down':
            if (this.y + this.height >= center - STOP_BUFFER
             && this.y + this.height <= center - STOP_BUFFER + 50) {
              return true;
            }
            break;
          case 'up':
            if (this.y <= center + STOP_BUFFER
             && this.y >= center + STOP_BUFFER - 50) {
              return true;
            }
            break;
          case 'left':
            if (this.x <= center + STOP_BUFFER
             && this.x >= center + STOP_BUFFER - 50) {
              return true;
            }
            break;
          case 'right':
            if (this.x + this.width >= center - STOP_BUFFER
             && this.x + this.width <= center - STOP_BUFFER + 50) {
              return true;
            }
            break;
        }
      }
    }

    return false;
  }

  isPedestrianOnCrosswalk(pedKey, pedestrians) {
    const CROSSWALK_WIDTH  = 10;
    const CROSSWALK_LENGTH = 150;
    const ROAD_WIDTH       = this.canvasSize / 4;
    const center           = this.canvasSize / 2;
    const halfRW           = ROAD_WIDTH / 2;
    const halfCL           = CROSSWALK_LENGTH / 2;

    let region;
    switch (pedKey) {
      case 'top':
        region = {
          xMin: center - halfCL,
          xMax: center + halfCL,
          yMin: center - halfRW - CROSSWALK_WIDTH * 2,
          yMax: center - halfRW - CROSSWALK_WIDTH * 2 + CROSSWALK_WIDTH
        };
        break;
      case 'bottom':
        region = {
          xMin: center - halfCL,
          xMax: center + halfCL,
          yMin: center + halfRW + CROSSWALK_WIDTH,
          yMax: center + halfRW + CROSSWALK_WIDTH * 2
        };
        break;
      case 'left':
        region = {
          xMin: center - halfRW - CROSSWALK_WIDTH * 2,
          xMax: center - halfRW - CROSSWALK_WIDTH * 2 + CROSSWALK_WIDTH,
          yMin: center - halfCL,
          yMax: center + halfCL
        };
        break;
      case 'right':
        region = {
          xMin: center + halfRW + CROSSWALK_WIDTH,
          xMax: center + halfRW + CROSSWALK_WIDTH * 2,
          yMin: center - halfCL,
          yMax: center + halfCL
        };
        break;
    }

    return pedestrians.some(p => 
      p.x >= region.xMin && p.x <= region.xMax &&
      p.y >= region.yMin && p.y <= region.yMax
    );
  }

  turn() {
    const TURNS = {
      up:    { left: 'left',  right: 'right', straight: 'up'   },
      down:  { left: 'right', right: 'left',  straight: 'down' },
      left:  { left: 'down',  right: 'up',    straight: 'left' },
      right: { left: 'up',    right: 'down',  straight: 'right'}
    };

    this.direction = TURNS[this.direction][this.turnDirection];
    this.hasTurned = true;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    if (this.direction === 'left' || this.direction === 'right') {
      ctx.fillRect(this.x, this.y, this.height, this.width);
    } else {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}
