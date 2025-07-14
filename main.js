import { spawnCar, spawnPedestrian } from './spawner.js';
import { TrafficController }         from './controller.js';
import { TrafficLight }              from './models/trafficLight.js';

let canvas, ctx, controller;

const CANVAS_SIZE      = 800;
const ROAD_WIDTH       = CANVAS_SIZE / 4;
const LANE_WIDTH       = ROAD_WIDTH   / 2;
const CROSSWALK_WIDTH  = 10;
const CROSSWALK_LENGTH = 150;

const cars        = [];
const pedestrians = [];

const lights = [
  new TrafficLight(390, 280, 'vertical'),
  new TrafficLight(390, 510, 'vertical'),
  new TrafficLight(280, 390, 'horizontal'),
  new TrafficLight(510, 390, 'horizontal'),
];

const pedestrianLights = {
  top:    new TrafficLight(CANVAS_SIZE/2, CANVAS_SIZE/2 - ROAD_WIDTH/2 - CROSSWALK_WIDTH*2, 'horizontal'),
  bottom: new TrafficLight(CANVAS_SIZE/2, CANVAS_SIZE/2 + ROAD_WIDTH/2 + CROSSWALK_WIDTH,   'horizontal'),
  left:   new TrafficLight(CANVAS_SIZE/2 - ROAD_WIDTH/2 - CROSSWALK_WIDTH*2, CANVAS_SIZE/2, 'vertical'),
  right:  new TrafficLight(CANVAS_SIZE/2 + ROAD_WIDTH/2 + CROSSWALK_WIDTH,    CANVAS_SIZE/2, 'vertical'),
};

window.addEventListener('DOMContentLoaded', () => {
  canvas     = document.getElementById('crossCanvas');
  ctx        = canvas.getContext('2d');
  controller = new TrafficController(lights, pedestrianLights, CANVAS_SIZE);

  document.getElementById('mode-pedestrians_alone')
    .onclick = () => controller.setMode('pedestrians_alone');

  document.getElementById('mode-time_fixed')
    .onclick = () => controller.setMode('time_fixed');

  document.getElementById('mode-time_responsive')
    .onclick = () => controller.setMode('time_responsive');

  spawnLoop();
  controllerDraw()
  requestAnimationFrame(animate);
});

function spawnLoop() {
  spawnCar(cars, CANVAS_SIZE, LANE_WIDTH);
  spawnPedestrian(pedestrians, CANVAS_SIZE, ROAD_WIDTH);
  setTimeout(spawnLoop, 2000);
}

function drawIntersection() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.fillStyle = '#333';
  // roads
  ctx.fillRect((CANVAS_SIZE - ROAD_WIDTH)/2, 0, ROAD_WIDTH, CANVAS_SIZE);
  ctx.fillRect(0, (CANVAS_SIZE - ROAD_WIDTH)/2, CANVAS_SIZE, ROAD_WIDTH);

  // lines
  ctx.strokeStyle = 'white';
  ctx.lineWidth   = 2;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo((CANVAS_SIZE - ROAD_WIDTH)/2 + LANE_WIDTH, 0);
  ctx.lineTo((CANVAS_SIZE - ROAD_WIDTH)/2 + LANE_WIDTH, CANVAS_SIZE);
  ctx.moveTo(0, (CANVAS_SIZE - ROAD_WIDTH)/2 + LANE_WIDTH);
  ctx.lineTo(CANVAS_SIZE, (CANVAS_SIZE - ROAD_WIDTH)/2 + LANE_WIDTH);
  ctx.stroke();
  ctx.setLineDash([]);

  // crosswalks
  ctx.fillStyle = 'white';
  const positions = [
    [(CANVAS_SIZE - CROSSWALK_LENGTH)/2, (CANVAS_SIZE - ROAD_WIDTH)/2 - CROSSWALK_WIDTH*2, false],
    [(CANVAS_SIZE - CROSSWALK_LENGTH)/2, (CANVAS_SIZE + ROAD_WIDTH)/2 + CROSSWALK_WIDTH,   false],
    [(CANVAS_SIZE - ROAD_WIDTH)/2 - CROSSWALK_WIDTH*2, (CANVAS_SIZE - CROSSWALK_LENGTH)/2, true ],
    [(CANVAS_SIZE + ROAD_WIDTH)/2 + CROSSWALK_WIDTH,     (CANVAS_SIZE - CROSSWALK_LENGTH)/2, true ],
  ];
  positions.forEach(([x,y,vert]) => {
    for (let i = 0; i < 8; i++) {
      if (vert) ctx.fillRect(x, y + i*CROSSWALK_WIDTH*2, CROSSWALK_WIDTH, CROSSWALK_WIDTH);
      else      ctx.fillRect(x + i*CROSSWALK_WIDTH*2, y, CROSSWALK_WIDTH, CROSSWALK_WIDTH);
    }
  });
}

function animate() {
  drawIntersection();

  for (let i = cars.length - 1; i >= 0; i--) {
    const car = cars[i];
    car.update(lights, pedestrianLights, cars, pedestrians);
    car.draw(ctx);
    if (car.x < -100 || car.x > CANVAS_SIZE+100 || car.y < -100 || car.y > CANVAS_SIZE+100) {
      cars.splice(i, 1);
    }
  }

  for (let i = pedestrians.length - 1; i >= 0; i--) {
    const ped = pedestrians[i];
    ped.update(pedestrianLights);
    ped.draw(ctx);
    if (ped.x < -50 || ped.x > CANVAS_SIZE+50 || ped.y < -50 || ped.y > CANVAS_SIZE+50) {
      pedestrians.splice(i, 1);
    }
  }

  lights.forEach(l => l.draw(ctx));

  requestAnimationFrame(animate);
}

function controllerDraw() {
  const delay = controller.cycle(cars);
  setTimeout(controllerDraw, delay);
}
