export class TrafficController {
  constructor(lights, pedestrianLights, canvasSize) {
    this.lights = lights;
    this.pedestrianLights = pedestrianLights;
    this.canvasSize = canvasSize;
    this.phase = 0;
    this.mode = 'time_fixed';
  }

  setMode(mode) {
    this.mode = mode;
    this.phase = 0;
  }

  // returns delay
  cycle(cars) {
    const center = this.canvasSize / 2;
    const stopBuffer = 150;

    if (this.mode === 'pedestrians_alone') {
      this.phase = (this.phase + 1) % 3;
      if (this.phase < 2) {
        this._allPedestrian('red');
        this._carPhase(this.phase === 0 ? 'NS' : 'EW');
      } else {
        this._allCar('red');
        this._allPedestrian('green');
      }
      return 4000;
    }

    if (this.mode === 'time_fixed') {
      this.phase = (this.phase + 1) % 2;
      this._carPhase(this.phase === 0 ? 'NS' : 'EW');
      this._pedestrianCross(this.phase);
      return 4000;
    }

    // for responsive time -> if (this.mode === 'time_responsive')
    this.phase = (this.phase + 1) % 2;
    const { td: topDown, rl: rightLeft } = this._getWaitingCounts(cars, center, stopBuffer);
    const axis = topDown > rightLeft ? 'NS' : 'EW';
    this._carPhase(axis);
    this._pedestrianCross(axis === 'NS' ? 0 : 1);
    return 800 + Math.abs(topDown - rightLeft) * 200;
  }

  _carPhase(axis) {
    this._allCar('red');
    const greenGroup = axis === 'NS' ? [0,1] : [2,3];
    greenGroup.forEach(i => this.lights[i].setState('green'));
  }

  _pedestrianCross(index) {
    this._allPedestrian('red');
    const keys = index === 0 ? ['top','bottom'] : ['left','right'];
    keys.forEach(k => this.pedestrianLights[k].setState('green'));
  }

  _allCar(state) {
    this.lights.forEach(l => l.setState(state));
  }

  _allPedestrian(state) {
    Object.values(this.pedestrianLights).forEach(l => l.setState(state));
  }

  _getWaitingCounts(cars, center, stopBuffer) {
    let td = 0, rl = 0;
    cars.forEach(car => {
      if (car.hasTurned) return;
      if (car.direction === 'down' || car.direction === 'up') {
        const frontY = car.direction === 'down' ? car.y + car.height : car.y;
        if (frontY >= center - stopBuffer && frontY <= center) td++;
      } else {
        const frontX = car.direction === 'right' ? car.x + car.width : car.x;
        if (frontX >= center - stopBuffer && frontX <= center) rl++;
      }
    });
    return { td, rl };
  }
}
