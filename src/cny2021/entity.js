import { TILE_SIZE, ROTATIONS, DIRECTIONS, SHAPES, MODES } from './constants'

class Entity {
  constructor (app) {
    this._app = app
    
    // Expired entities are removed at the end of the cycle.
    this._expired = false
    
    this.x = 0
    this.y = 0
    this.size = TILE_SIZE
    this._rotation = ROTATIONS.SOUTH  // Rotation in radians
    
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
    const camera = this._app.camera
    
    c2d.fillStyle = '#888'
    
    // DEBUG: Player colours
    if ( this === this._app.player) {
      c2d.fillStyle = '#c44'
      if (this._app.mode === MODES.ACTION_PLAYER_INTERACTING) {
        c2d.fillStyle = '#e42'
      }
    }
    
    // DEBUG: shape outline
    switch (this.shape) {
    case SHAPES.CIRCLE:
      c2d.beginPath()
      c2d.arc(this.x + camera.x, this.y + camera.y, this.size / 2, 0, 2 * Math.PI)
      c2d.fill()
      c2d.closePath()
      break
    case SHAPES.SQUARE:
      c2d.beginPath()
      c2d.rect(this.x + camera.x - this.size / 2, this.y + camera.y - this.size / 2, this.size, this.size)
      c2d.fill()
      c2d.closePath()
      break
    case SHAPES.POLYGON:
      c2d.beginPath()
      let coords = this.vertices
      if (coords.length >= 1) c2d.moveTo(coords[coords.length-1].x + camera.x, coords[coords.length-1].y + camera.y)
      for (let i = 0 ; i < coords.length ; i++) {
        c2d.lineTo(coords[i].x + camera.x, coords[i].y + camera.y)
      }            
      c2d.fill()
      c2d.closePath()
      break
    }
    
    c2d.fillStyle = '#000'
    c2d.beginPath()
    c2d.arc(this.x + camera.x, this.y + camera.y, 2, 0, 2 * Math.PI)
    c2d.fill()
  }
  
  onCollision (target, collisionCorrection) {
    console.log('BONK')
    
    if (
      this.shape === SHAPES.CIRCLE && target.shape === SHAPES.CIRCLE
    ) {
      const speed = Math.sqrt(this.moveX * this.moveX + this.moveY * this.moveY)
      const angle = Math.atan2(collisionCorrection.y - this.y, collisionCorrection.x - this.x)
      
      this.moveX = Math.cos(angle) * speed
      this.moveY = Math.sin(angle) * speed
      
      this.x = collisionCorrection.x
      this.y = collisionCorrection.y
    } else if (
      this.shape === SHAPES.CIRCLE
      && (target.shape === SHAPES.SQUARE || target.shape === SHAPES.POLYGON)
    ) {
      // TODO
      
      const speed = Math.sqrt(this.moveX * this.moveX + this.moveY * this.moveY)
      const originalAngle = Math.atan2(this.moveY, this.moveX)
      const reverseOriginalAngle = Math.atan2(-this.moveY, -this.moveX)
      const normalAngle = Math.atan2(collisionCorrection.y - this.y, collisionCorrection.x - this.x)
      
      const toDegree = (rad) => (rad * 180 / Math.PI).toFixed(2)
      
      if (this === this._app.player) {
        console.log('original angle: ', toDegree(originalAngle))
        console.log('rev ori angle: ', toDegree(reverseOriginalAngle))
        console.log('normal angle: ', toDegree(normalAngle))
      }
      
      const angle = normalAngle
      
      this.moveX = Math.cos(angle) * speed
      this.moveY = Math.sin(angle) * speed
      
      this.x = collisionCorrection.x
      this.y = collisionCorrection.y
      
    } else {
      this.x = collisionCorrection.x
      this.y = collisionCorrection.y
    }
    
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