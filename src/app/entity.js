import { TILE_SIZE, ROTATIONS, DIRECTIONS, SHAPES, MODES } from './constants'

class Entity {
  constructor (app) {
    this._app = app
    
    this.x = 0
    this.y = 0
    this._rotation = ROTATIONS.SOUTH;  // Rotation in radians
    
    this.size = TILE_SIZE
    
    // Movement: self locomotion and external (pushed) movement.
    this.moveX = 0
    this.moveY = 0
    this.pushX = 0
    this.pushY = 0
    
    this.shape = SHAPES.NONE
    this.shapePolygonPath = null  // Only applicable if shape === SHAPES.POLYGON
    this.solid = false
    this.movable = false
    
    // this.moveAcceleration = 0.5;
    this.moveDeceleration = 0.5;
    this.moveMaxSpeed = 8;
  }
  
  play (timeStep) {
    
    // Upkeep: deceleration
    const moveDeceleration = this.moveDeceleration * timeStep / 1000 || 0;
    const curRotation = Math.atan2(this.moveY, this.moveX)
    const curMoveSpeed = Math.sqrt(this.moveX * this.moveX + this.moveY * this.moveY);
    const newMoveSpeed = Math.max(0, curMoveSpeed - moveDeceleration);

    this.moveX = newMoveSpeed * Math.cos(curRotation);
    this.moveY = newMoveSpeed * Math.sin(curRotation);
    
  }
  
  paint () {
    const c2d = this._app.canvas2d
    
    c2d.fillStyle = '#844'
    
    // DEBUG

    if (this._app.mode === MODES.ACTION_PLAYER_INTERACTING) {      
      c2d.fillStyle = '#e42'
    }
    
    c2d.beginPath();
    c2d.arc(this.x, this.y, this.size / 2, 0, 2 * Math.PI);
    c2d.fill()
  }
  
  onCollision (target, collisionCorrection) {
    console.log('BONK')
  }
}

export default Entity;