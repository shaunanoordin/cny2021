export const TILE_SIZE = 64
export const GRID_WIDTH = 24
export const GRID_HEIGHT = 16
export const ACCEPTABLE_INPUT_DISTANCE_FROM_HERO = TILE_SIZE

export const SHAPES = {
  NONE: 'none',
  CIRCLE: 'circle',
  SQUARE: 'square',
  POLYGON: 'polygon',
}

export const ROTATIONS = {
  EAST: 0,
  SOUTHEAST: Math.PI * 0.25,
  SOUTH: Math.PI * 0.5,
  SOUTHWEST: Math.PI * 0.75,
  WEST: Math.PI,
  NORTHWEST: Math.PI * -0.75,
  NORTH: Math.PI * -0.5,
  NORTHEAST: Math.PI * -0.25,
}

export const DIRECTIONS = {
  EAST: 0,
  SOUTH: 1,
  WEST: 2,
  NORTH: 3,
}

export const PLAYER_ACTIONS = {
  IDLE: 'idle',  // Player isn't doing anything
  PULLING: 'pulling',  // Player is actively interacting with the canvas, pulling the 'ball' to be launched.
}

/*
While the engine is technically able to support any given framerate (determined
by the hardware), a baseline is required to ground our video game logic to.
e.g. we can say that we expect an object with "movement speed" of "2" to travel
120 pixels in 1 second. (2 pixels per frame * 60 frames per second)
 */
export const EXPECTED_FRAMES_PER_SECOND = 60
export const EXPECTED_TIMESTEP = 1000 / EXPECTED_FRAMES_PER_SECOND
