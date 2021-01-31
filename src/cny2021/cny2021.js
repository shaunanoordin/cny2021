import {
  GRID_WIDTH, GRID_HEIGHT, TILE_SIZE,
  MODES, SHAPES,
  EXPECTED_TIMESTEP,
  ACCEPTABLE_INPUT_DISTANCE_FROM_PLAYER_ENTITY,
} from './constants'
import Entity from './entity'
import Physics from './physics'

class CNY2021 {
  constructor () {
    this.html = {
      main: document.getElementById('main'),
      canvas: document.getElementById('canvas'),
      interaction: document.getElementById('interaction'),
      buttonHome: document.getElementById('button-home'),
      buttonFullscreen: document.getElementById('button-fullscreen'),
    }
    
    this.mode = MODES.INITIALISING
    this.interaction = false
    this.setInteraction(false)
    
    this.canvas2d = this.html.canvas.getContext('2d')
    this.canvasWidth = TILE_SIZE * GRID_WIDTH
    this.canvasHeight = TILE_SIZE * GRID_HEIGHT
    
    this.camera = {
      target: null,  // Target entity to follow. If null, camera is static.
      x: 0,
      y: 0,      
    }
    
    this.initialiseUI()
    
    this.ready = false
    this.assets = {
      // ...
    }
    
    this.player = null
    this.entities = []
    
    this.playerInput = {
      pointerStart: undefined,
      pointerCurrent: undefined,
      pointerEnd: undefined,
    }

    this.prevTime = null
    this.nextFrame = window.requestAnimationFrame(this.main.bind(this))
  }
  
  initialisationCheck () {
    // Assets check
    let allAssetsLoaded = true
    let numLoadedAssets = 0
    let numTotalAssets = 0
    Object.keys(this.assets).forEach((id) => {
      const asset = this.assets[id]
      allAssetsLoaded = allAssetsLoaded && asset.loaded
      if (asset.loaded) numLoadedAssets++
      numTotalAssets++
    })
    
    // Paint status
    this.canvas2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.canvas2d.textAlign = 'start'
    this.canvas2d.textBaseline = 'top'
    this.canvas2d.fillStyle = '#ccc'
    this.canvas2d.font = `1em monospace`
    this.canvas2d.fillText(`Loading ${numLoadedAssets} / ${numTotalAssets} `, TILE_SIZE, TILE_SIZE)
    
    if (allAssetsLoaded) {
      this.ready = true
      this.loadLevel(0)
    }
  }
  
  resetLevel () {
    this.mode = MODES.ACTION_IDLE
    this.player = undefined
    this.entities = []
    this.camera = {
      target: null, x: 0, y: 0,
    }
  }
  
  loadLevel (level = 0) {
    this.resetLevel()
    
    this.player = new Entity(this)
    this.player.x = TILE_SIZE * GRID_WIDTH / 2
    this.player.y = TILE_SIZE * GRID_HEIGHT / 2
    this.entities.push(this.player)
    this.camera.target = this.player
    
    let testEntity, testAngle, testDistance
    
    testEntity = new Entity(this)
    testAngle = Math.random() * 2 * Math.PI
    testDistance = (Math.random() * 2 + 2) * TILE_SIZE
    testEntity.x = Math.cos(testAngle) * testDistance + this.player.x
    testEntity.y = Math.sin(testAngle) * testDistance + this.player.y
    this.entities.push(testEntity)
    
    testEntity = new Entity(this)
    testEntity.shape = SHAPES.SQUARE
    testAngle = Math.random() * 2 * Math.PI
    testDistance = (Math.random() * 2 + 2) * TILE_SIZE
    testEntity.x = Math.cos(testAngle) * testDistance + this.player.x
    testEntity.y = Math.sin(testAngle) * testDistance + this.player.y
    this.entities.push(testEntity)
    
    // West wall
    testEntity = new Entity(this)
    testEntity.shape = SHAPES.POLYGON
    testEntity.x = -TILE_SIZE
    testEntity.y = 0
    testEntity.shapePolygonPath = [0, 0, TILE_SIZE, 0, TILE_SIZE, TILE_SIZE * GRID_HEIGHT, 0, TILE_SIZE * GRID_HEIGHT]
    testEntity.movable = false
    this.entities.push(testEntity)
    
    // East wall
    testEntity = new Entity(this)
    testEntity.shape = SHAPES.POLYGON
    testEntity.x = TILE_SIZE * GRID_WIDTH
    testEntity.y = 0
    testEntity.shapePolygonPath = [0, 0, TILE_SIZE, 0, TILE_SIZE, TILE_SIZE * GRID_HEIGHT, 0, TILE_SIZE * GRID_HEIGHT]
    testEntity.movable = false
    this.entities.push(testEntity)
    
    // North wall
    testEntity = new Entity(this)
    testEntity.shape = SHAPES.POLYGON
    testEntity.x = 0
    testEntity.y = -TILE_SIZE
    testEntity.shapePolygonPath = [0, 0, TILE_SIZE * GRID_WIDTH, 0, TILE_SIZE * GRID_WIDTH, TILE_SIZE, 0, TILE_SIZE]
    testEntity.movable = false
    this.entities.push(testEntity)
    
    // South
    testEntity = new Entity(this)
    testEntity.shape = SHAPES.POLYGON
    testEntity.x = 0
    testEntity.y = TILE_SIZE * GRID_HEIGHT
    testEntity.shapePolygonPath = [0, 0, TILE_SIZE * GRID_WIDTH, 0, TILE_SIZE * GRID_WIDTH, TILE_SIZE, 0, TILE_SIZE]
    testEntity.movable = false
    this.entities.push(testEntity)

  }
  
  main (time) {
    const timeStep = (this.prevTime) ? time - this.prevTime : time
    this.prevTime = time
    
    if (this.ready) {
      this.play(timeStep)
      this.paint()
    } else {
      this.initialisationCheck()
    }
    
    this.nextFrame = window.requestAnimationFrame(this.main.bind(this))
  }
  
  play (timeStep) {
    this.entities.forEach(entity => entity.play(timeStep))
    
    this.processPhysics(timeStep)
  }
  
  paint () {
    const c2d = this.canvas2d
    const camera = this.camera
    
    // Camera Controls: focus the camera on the target entity, if any.
    if (camera.target) {
      camera.x = this.canvasWidth / 2 - camera.target.x
      camera.y = this.canvasHeight / 2 - camera.target.y
    }
    
    c2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    
    c2d.strokeStyle = 'rgba(128, 128, 128, 0.5)'
    c2d.lineWidth = 1
    
    // Draw grid
    for (let row = 0 ; row < GRID_HEIGHT ; row ++) {
      for (let col = 0 ; col < GRID_WIDTH ; col ++) {
        c2d.beginPath()
        c2d.rect(col * TILE_SIZE + camera.x, row * TILE_SIZE + camera.y, TILE_SIZE, TILE_SIZE)
        c2d.stroke()
      }
    }
    
    // Draw entities
    this.entities.forEach(entity => entity.paint())
    
    // Draw player input
    if (this.mode === MODES.ACTION_PLAYER_INTERACTING
        && this.player
        && this.playerInput.pointerCurrent
       ) {
      
      const inputCoords = this.playerInput.pointerCurrent
      
      c2d.strokeStyle = '#888'
      c2d.lineWidth = TILE_SIZE / 8
      
      c2d.beginPath()
      c2d.moveTo(this.player.x + camera.x, this.player.y + camera.y)
      c2d.lineTo(inputCoords.x, inputCoords.y)
      c2d.stroke()
      c2d.beginPath()
      c2d.arc(inputCoords.x, inputCoords.y, ACCEPTABLE_INPUT_DISTANCE_FROM_PLAYER_ENTITY, 0, 2 * Math.PI)
      c2d.stroke()
      
      const arrowCoords = {
        x: this.player.x - (inputCoords.x - this.player.x) + camera.x,
        y: this.player.y - (inputCoords.y - this.player.y) + camera.y,
      }
      c2d.strokeStyle = '#e42'
      c2d.lineWidth = TILE_SIZE / 8
      
      c2d.beginPath()
      c2d.moveTo(this.player.x + camera.x, this.player.y + camera.y)
      c2d.lineTo(arrowCoords.x + camera.x, arrowCoords.y + camera.y)
      c2d.stroke()
    }
  }
  
  onPointerDown (e) {
    const coords = getEventCoords(e, this.html.canvas)
    const camera = this.camera
    
    this.playerInput.pointerStart = undefined
    this.playerInput.pointerCurrent = undefined
    this.playerInput.pointerEnd = undefined
    
    if (this.player) {
      const distX = this.player.x - coords.x + camera.x
      const distY = this.player.y - coords.y + camera.y
      const distFromPlayer = Math.sqrt(distX * distX + distY + distY)
      const rotation = Math.atan2(distY, distX)
      
      if (distFromPlayer < ACCEPTABLE_INPUT_DISTANCE_FROM_PLAYER_ENTITY) {
        this.mode = MODES.ACTION_PLAYER_INTERACTING
        this.playerInput.pointerStart = coords
        this.playerInput.pointerCurrent = coords
      }
    }
    
    return stopEvent(e)
  }
  
  initialiseUI () {
    this.html.canvas.width = this.canvasWidth
    this.html.canvas.height = this.canvasHeight
    
    this.html.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this))
    this.html.canvas.addEventListener('pointermove', this.onPointerMove.bind(this))
    this.html.canvas.addEventListener('pointerup', this.onPointerUp.bind(this))
    this.html.canvas.addEventListener('pointercancel', this.onPointerUp.bind(this))
    
    // Prevent "touch and hold to open context menu" interaction on touchscreens.
    this.html.canvas.addEventListener('touchstart', stopEvent)
    this.html.canvas.addEventListener('touchmove', stopEvent)
    this.html.canvas.addEventListener('touchend', stopEvent)
    this.html.canvas.addEventListener('touchcancel', stopEvent)
    
    this.html.buttonHome.addEventListener('click', this.buttonHome_onClick.bind(this))
    this.html.buttonFullscreen.addEventListener('click', this.buttonFullscreen_onClick.bind(this))
    
    window.addEventListener('resize', this.updateUI.bind(this))
    this.updateUI()
  }
  
  updateUI () {
    // Fit the Interaction layer to the canvas
    const canvasBounds = this.html.canvas.getBoundingClientRect()
    this.html.interaction.style.width = `${canvasBounds.width}px`
    this.html.interaction.style.height = `${canvasBounds.height}px`
    this.html.interaction.style.top = '0'
    this.html.interaction.style.left = `${canvasBounds.left}px`
  }
  
  setInteraction (interaction) {
    this.interaction = interaction
    if (interaction) {
      this.html.interaction.style.visibility = 'visible'
    } else {
      this.html.interaction.style.visibility = 'hidden'
    }
  }
  
  onPointerMove (e) {
    const coords = getEventCoords(e, this.html.canvas)
    this.playerInput.pointerCurrent = coords
    
    if (this.mode === MODES.ACTION_PLAYER_INTERACTING) {
      // ...
    }
    
    return stopEvent(e)
  }
  
  onPointerUp (e) {
    const coords = getEventCoords(e, this.html.canvas)
    
    if (this.mode === MODES.ACTION_PLAYER_INTERACTING) {
      this.playerInput.pointerEnd = coords
      // this.mode = MODES.ACTION_MOVEMENT
      this.mode = MODES.ACTION_IDLE
      this.shoot()
    }
    
    return stopEvent(e)
  }
  
  buttonHome_onClick () {
    this.setInteraction(!this.interaction)
  }
  
  buttonFullscreen_onClick () {
    const isFullscreen = document.fullscreenElement
    if (!isFullscreen) {
      if (this.html.main.requestFullscreen) {
        this.html.main.className = 'fullscreen'
        this.html.main.requestFullscreen()
      }
    } else {
      document.exitFullscreen?.()
      this.html.main.className = ''
    }
    this.updateUI()
  }
  
  shoot () {
    if (!this.player || !this.playerInput.pointerCurrent) return
    
    const camera = this.camera
    
    const inputCoords = this.playerInput.pointerCurrent
    const directionX = this.player.x - inputCoords.x + camera.x
    const directionY = this.player.y - inputCoords.y + camera.y
    const dist = Math.sqrt(directionX * directionX + directionY * directionY)
    const rotation = Math.atan2(directionY, directionX)

    const MAX_PULL_DISTANCE = TILE_SIZE * 4
    const intendedMovement = dist / MAX_PULL_DISTANCE * this.player.moveMaxSpeed
    const movementSpeed = Math.min(
      intendedMovement,
      this.player.moveMaxSpeed
    )
    
    console.log('MOVEMENT SPEED: ', movementSpeed)
    
    this.player.speedX = Math.cos(rotation) * movementSpeed
    this.player.speedY = Math.sin(rotation) * movementSpeed
    
  }
  
  processPhysics (timeStep) {
    const timeCorrection = (timeStep / EXPECTED_TIMESTEP)
    
    // Move Actors and Particles
    this.entities.forEach(entity => {
      entity.x += entity.speedX * timeCorrection
      entity.y += entity.speedY * timeCorrection
    })
    
    for (let a = 0 ; a < this.entities.length ; a++) {
      let entityA = this.entities[a]
      
      for (let b = a + 1 ; b < this.entities.length ; b++) {
        let entityB = this.entities[b]
        let collisionCorrection = Physics.checkCollision(entityA, entityB)
        
        if (collisionCorrection) {
          /*entityA.x = collisionCorrection.a.x
          entityA.y = collisionCorrection.a.y
          entityB.x = collisionCorrection.b.x
          entityB.y = collisionCorrection.b.y*/
          entityA.onCollision(entityB, collisionCorrection.a)
          entityB.onCollision(entityA, collisionCorrection.b)
        }
      }
    }  
  }
}

function getEventCoords (event, element) {
  const xRatio = (element.width && element.offsetWidth) ? element.width / element.offsetWidth : 1
  const yRatio = (element.height && element.offsetHeight) ? element.height / element.offsetHeight : 1
  
  const x = event.offsetX * xRatio
  const y = event.offsetY * yRatio
  return { x, y }
}

function stopEvent (e) {
  if (!e) return false
  e.preventDefault && e.preventDefault()
  e.stopPropagation && e.stopPropagation()
  e.returnValue = false
  e.cancelBubble = true
  return false
}

export default CNY2021