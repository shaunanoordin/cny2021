import { TILE_SIZE, ROTATIONS, DIRECTIONS, SHAPES, PLAYER_ACTIONS, EXPECTED_TIMESTEP } from './constants'

class Entity {
  constructor (app) {
    this._app = app
    
    // Expired entities are removed at the end of the cycle.
    this._expired = false
    
    this.x = 0
    this.y = 0
    this.z = 0  // Only relevant to paint(), not to physics
    this.size = TILE_SIZE
    this._rotation = ROTATIONS.SOUTH  // Rotation in radians
    
    // Movement: self locomotion and external (pushed) movement.
    this.speedX = 0
    this.speedY = 0
    this.pushX = 0
    this.pushY = 0
    
    this.shape = SHAPES.CIRCLE
    this.shapePolygonPath = null  // Only applicable if shape === SHAPES.POLYGON
    this.solid = true
    this.movable = true
    this.mass = 2  // Only matters if solid && movable
    
    // this.moveAcceleration = 0.5
    this.moveDeceleration = 0.5
    this.moveMaxSpeed = 16
    
    this.colour = '#ccc'
    this.animationCounter = 0
    this.animationCounterMax = 0
  }
  
  play (timeStep) {
    // Update position
    const timeCorrection = (timeStep / EXPECTED_TIMESTEP)
    this.x += this.speedX * timeCorrection
    this.y += this.speedY * timeCorrection
    
    // Upkeep: deceleration
    const moveDeceleration = this.moveDeceleration * timeStep / 1000 || 0
    const curRotation = Math.atan2(this.speedY, this.speedX)
    const curMoveSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY)
    const newMoveSpeed = Math.max(0, curMoveSpeed - moveDeceleration)

    this.speedX = newMoveSpeed * Math.cos(curRotation)
    this.speedY = newMoveSpeed * Math.sin(curRotation)
    
    // Step through animation
    if (this.animationCounterMax > 0) {
      this.animationCounter = (this.animationCounter + timeStep) % this.animationCounterMax
    }
  }
  
  paint () {
    /*
    c2d.fillStyle = '#888'
    if (this.movable && this.solid) {
      c2d.fillStyle = '#48c'
    }
    
    // DEBUG: Player colours
    if (this === this._app.hero) {
      c2d.fillStyle = '#c44'
      if (this._app.playerAction === PLAYER_ACTIONS.PULLING) {
        c2d.fillStyle = '#e42'
      }
    }*/
    
    this.paint_outline()
  }
  
  paint_outline () {
    const c2d = this._app.canvas2d
    const camera = this._app.camera
    
    c2d.fillStyle = this.colour
    c2d.strokeStyle = '#444'
    c2d.lineWidth = this.mass
    
    // Draw shape outline
    switch (this.shape) {
    case SHAPES.CIRCLE:
      c2d.beginPath()
      c2d.arc(this.x + camera.x, this.y + camera.y, this.size / 2, 0, 2 * Math.PI)
      c2d.closePath()
      c2d.fill()
      this.solid && c2d.stroke()
      break
    case SHAPES.SQUARE:
      c2d.beginPath()
      c2d.rect(this.x + camera.x - this.size / 2, this.y + camera.y - this.size / 2, this.size, this.size)
      c2d.closePath()
      c2d.fill()
      this.solid && c2d.stroke()
      break
    case SHAPES.POLYGON:
      c2d.beginPath()
      let coords = this.vertices
      if (coords.length >= 1) c2d.moveTo(coords[coords.length-1].x + camera.x, coords[coords.length-1].y + camera.y)
      for (let i = 0 ; i < coords.length ; i++) {
        c2d.lineTo(coords[i].x + camera.x, coords[i].y + camera.y)
      }
      c2d.closePath()
      c2d.fill()
      this.solid && c2d.stroke()
      break
    }
    
    // Draw anchor point, mostly for debugging
    c2d.fillStyle = 'rgba(255, 255, 255, 0.5)'
    c2d.beginPath()
    c2d.arc(this.x + camera.x, this.y + camera.y, 2, 0, 2 * Math.PI)
    c2d.fill()
  }
  
  onCollision (target, collisionCorrection) {
    // when two solid shapes collide, bounce!
    if (
      this.movable && this.solid
      && !target.movable && target.solid
    ) {
      if (
        this.shape === SHAPES.CIRCLE && target.shape === SHAPES.CIRCLE
      ) {
        
        // For circle + circle collisions, the collision correction already
        // tells us the bounce direction.
        const angle = Math.atan2(collisionCorrection.y - this.y, collisionCorrection.x - this.x)
        const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY)

        this.speedX = Math.cos(angle) * speed
        this.speedY = Math.sin(angle) * speed

      } else if (
        this.shape === SHAPES.CIRCLE
        && (target.shape === SHAPES.SQUARE || target.shape === SHAPES.POLYGON)
      ) {
        
        // For circle + polygon collisions, we need to know...
        // - the original angle this circle was moving towards (or rather, its
        //   reverse, because we want a bounce)
        // - the normal vector (of the edge) of the polygon this circle collided
        //   into (which we can get from the collision correction)
        // - the angle between them
        const reverseOriginalAngle = Math.atan2(-this.speedY, -this.speedX)
        const normalAngle = Math.atan2(collisionCorrection.y - this.y, collisionCorrection.x - this.x)
        const angleBetween = normalAngle - reverseOriginalAngle
        const angle = reverseOriginalAngle + 2 * angleBetween

        const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY)

        this.speedX = Math.cos(angle) * speed
        this.speedY = Math.sin(angle) * speed
        
      } else {
        // For the moment, we're not too concerned about polygons bumping into each other
      }
    } else if (
      this.movable && this.solid
      && target.movable && target.solid
      && collisionCorrection.speedX !== undefined
      && collisionCorrection.speedY !== undefined
    ) {
      this.speedX = collisionCorrection.speedX
      this.speedY = collisionCorrection.speedY
    }
    
    this.x = collisionCorrection.x
    this.y = collisionCorrection.y
    
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
  
  get movementSpeed () {
    return Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY)
  }
  
  get movementAngle () {
    return Math.atan2(this.speedY, this.speedX)
  }
}

const CIRCLE_TO_POLYGON_APPROXIMATOR =
  [ROTATIONS.EAST, ROTATIONS.SOUTHEAST, ROTATIONS.SOUTH, ROTATIONS.SOUTHWEST,
   ROTATIONS.WEST, ROTATIONS.NORTHWEST, ROTATIONS.NORTH, ROTATIONS.NORTHEAST]
  .map((angle) => {
    return ({ cosAngle: Math.cos(angle), sinAngle: Math.sin(angle) })
  })

export default Entity