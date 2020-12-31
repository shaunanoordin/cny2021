import { TILE_SIZE, ROTATIONS, DIRECTIONS, SHAPES, MODES } from './constants'

class Entity {
  constructor (app) {
    this._app = app
    
    // Expired entities are removed at the end of the cycle.
    this._expired = false
    
    this.x = 0
    this.y = 0
    this.size = 32
    this._rotation = ROTATIONS.SOUTH  // Rotation in radians
    
    this.size = TILE_SIZE
    
    // Movement: self locomotion and external (pushed) movement.
    this.moveX = 0
    this.moveY = 0
    this.pushX = 0
    this.pushY = 0
    
    this.shape = SHAPES.CIRCLE
    this.shapePolygonPath = null  // Only applicable if shape === SHAPES.POLYGON
    this.solid = true
    this.movable = true
    
    // this.moveAcceleration = 0.5
    this.moveDeceleration = 0.5
    this.moveMaxSpeed = 8
  }
  
  play (timeStep) {
    
    // Upkeep: deceleration
    const moveDeceleration = this.moveDeceleration * timeStep / 1000 || 0
    const curRotation = Math.atan2(this.moveY, this.moveX)
    const curMoveSpeed = Math.sqrt(this.moveX * this.moveX + this.moveY * this.moveY)
    const newMoveSpeed = Math.max(0, curMoveSpeed - moveDeceleration)

    this.moveX = newMoveSpeed * Math.cos(curRotation)
    this.moveY = newMoveSpeed * Math.sin(curRotation)
    
  }
  
  paint () {
    const c2d = this._app.canvas2d
    
    c2d.fillStyle = '#844'
    
    // DEBUG

    if (this._app.mode === MODES.ACTION_PLAYER_INTERACTING) {      
      c2d.fillStyle = '#e42'
    }
    
    c2d.beginPath()
    c2d.arc(this.x, this.y, this.size / 2, 0, 2 * Math.PI)
    c2d.fill()
  }
  
  onCollision (target, collisionCorrection) {
    console.log('BONK')
  }
  
  get left () { return this.x - this.size / 2 }
  get right () { return this.x + this.size / 2 }
  get top () { return this.y - this.size / 2 }
  get bottom () { return this.y + this.size / 2 }
  
  set left (val) { this.x = val + this.size / 2 }
  set right (val) { this.x = val - this.size / 2 }
  set top (val) { this.y = val + this.size / 2 }
  set bottom (val) { this.y = val - this.size / 2 }
  
  get radius () { return this.size / 2 }
  
  set radius (val) { this.size = val * 2 }
  
  get rotation () { return this._rotation }
  
  set rotation (val) {
    this._rotation = val
    while (this._rotation > Math.PI) { this._rotation -= Math.PI * 2 }
    while (this._rotation <= -Math.PI) { this._rotation += Math.PI * 2 }
  }
  
  get direction () {  //Get cardinal direction
    //Favour East and West when rotation is exactly SW, NW, SE or NE.
    if (this._rotation <= Math.PI * 0.25 && this._rotation >= Math.PI * -0.25) { return DIRECTIONS.EAST }
    else if (this._rotation > Math.PI * 0.25 && this._rotation < Math.PI * 0.75) { return DIRECTIONS.SOUTH }
    else if (this._rotation < Math.PI * -0.25 && this._rotation > Math.PI * -0.75) { return DIRECTIONS.NORTH }
    else { return DIRECTIONS.WEST }
  }
  
  set direction (val) {
    switch (val) {
      case DIRECTIONS.EAST:
        this._rotation = ROTATIONS.EAST
        break
      case DIRECTIONS.SOUTH:
        this._rotation = ROTATIONS.SOUTH
        break
      case DIRECTIONS.WEST:
        this._rotation = ROTATIONS.WEST
        break
      case DIRECTIONS.NORTH:
        this._rotation = ROTATIONS.NORTH
        break
    }
  }
  
  get vertices () {
    const v = []
    if (this.shape === SHAPES.SQUARE) {
      v.push({ x: this.left, y: this.top })
      v.push({ x: this.right, y: this.top })
      v.push({ x: this.right, y: this.bottom })
      v.push({ x: this.left, y: this.bottom })
    } else if (this.shape === SHAPES.CIRCLE) {  //Approximation
      CIRCLE_TO_POLYGON_APPROXIMATOR.map((approximator) => {
        v.push({ x: this.x + this.radius * approximator.cosAngle, y: this.y + this.radius * approximator.sinAngle })
      })
    } else if (this.shape === SHAPES.POLYGON) {
      if (!this.shapePolygonPath) return []
      for (let i = 0 ; i < this.shapePolygonPath.length ; i += 2) {
        v.push({ x: this.x + this.shapePolygonPath[i], y: this.y + this.shapePolygonPath[i+1] })
      }
    }
    return v
  }
}

const CIRCLE_TO_POLYGON_APPROXIMATOR =
  [ROTATIONS.EAST, ROTATIONS.SOUTHEAST, ROTATIONS.SOUTH, ROTATIONS.SOUTHWEST,
   ROTATIONS.WEST, ROTATIONS.NORTHWEST, ROTATIONS.NORTH, ROTATIONS.NORTHEAST]
  .map((angle) => {
    return ({ cosAngle: Math.cos(angle), sinAngle: Math.sin(angle) })
  })

export default Entity