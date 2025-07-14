import { Car } from './models/car.js';
import { Pedestrian } from './models/pedestrian.js';

export function spawnCar(cars, canvasSize, laneWidth) {
  const directions = ['up', 'down', 'left', 'right'];
  const direction = directions[Math.floor(Math.random() * directions.length)];
  const turnOptions = ['straight', 'left', 'right'];
  const turnDirection = turnOptions[Math.floor(Math.random() * turnOptions.length)];

  const offset = 50;
  const center = canvasSize / 2;
  let x, y;

  switch (direction) {
    case 'up':
      x = center + laneWidth / 2 - 10;
      y = canvasSize + offset;
      break;
    case 'down':
      x = center - laneWidth / 2 + 10;
      y = -offset;
      break;
    case 'left':
      x = canvasSize + offset;
      y = center - laneWidth / 2 + 10;
      break;
    case 'right':
      x = -offset;
      y = center + laneWidth / 2 - 10;
      break;
  }

  const colors = ['red', 'blue', 'green', 'yellow', 'orange'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  cars.push(new Car(x, y, direction, turnDirection, 2, color, canvasSize));
}

export function spawnPedestrian(pedestrians, canvasSize, roadWidth) {
  const directions = ['left', 'right', 'up', 'down'];
  const direction = directions[Math.floor(Math.random() * directions.length)];
  const offset = 20;
  const center = canvasSize / 2;
  let x, y;

  switch (direction) {
    case 'left':
      x = canvasSize + offset;
      y = center + roadWidth / 2 + 10;
      break;
    case 'right':
      x = -offset;
      y = center - roadWidth / 2 - 20;
      break;
    case 'up':
      x = center + roadWidth / 2 + offset - 10;
      y = canvasSize + offset;
      break;
    case 'down':
      x = center - roadWidth / 2 - offset;
      y = -offset;
      break;
  }

  pedestrians.push(new Pedestrian(x, y, direction, 1, 'white', canvasSize));
}
