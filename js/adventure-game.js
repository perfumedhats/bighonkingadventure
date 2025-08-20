// Atari Adventure Game
class AdventureGame {
    constructor(slideshow) {
        this.slideshow = slideshow;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game constants
        this.ROOM_SIZE = Math.min(window.innerWidth, window.innerHeight);
        this.PLAYER_SIZE = Math.max(8, Math.floor(this.ROOM_SIZE / 50));
        this.WALL_THICKNESS = Math.max(20, Math.floor(this.ROOM_SIZE / 20));
        this.DOOR_SIZE = Math.max(80, Math.floor(this.ROOM_SIZE * 0.2)); // 20% of room width
        
        // Player position (starts in room 0,0)
        this.playerRoom = { x: 0, y: 0 };
        this.playerX = this.ROOM_SIZE / 2;
        this.playerY = this.ROOM_SIZE / 2;
        
        // Blaster system
        this.blasters = [];
        this.lastMoveDirection = { x: 1, y: 0 }; // Track last movement direction
        this.BLASTER_SPEED = 10; // Pixels per frame at 30fps (150 pixels/second)
        this.BLASTER_SIZE = 10;
        
        // Alien system
        this.aliens = {}; // Store aliens by room key
        this.currentRoomAlien = null;
        
        // Doug Bar system
        this.dougBars = {}; // Store doug bars by room key
        this.currentRoomDougBar = null;
        
        // Warp Core system
        this.warpCore = null;
        this.currentRoomWarpCore = null;
        this.gameOver = false;
        
        // Score system
        this.score = 0;
        
        // Sound system
        this.soundManager = new SoundManager();
        
        // Room connections - hardcoded map
        // Each room can connect to up to 4 adjacent rooms (north, south, east, west)
        this.roomConnections = this.generateRoomConnections();
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Handle window resize
        this.setupResize();
        
        // Initialize warp core in a random exterior room
        this.initializeWarpCore();
        
        // Initialize current room alien and Doug Bar
        this.loadCurrentRoomAlien();
        this.loadCurrentRoomDougBar();
        
        // Frame rate control
        this.targetFPS = 30;
        this.frameTime = 1000 / this.targetFPS; // 33.33ms per frame
        this.lastTime = 0;
        this.accumulator = 0;
        
        // Game loop
        this.gameLoop();
    }
    
    generateRoomConnections() {
        const connections = {};
        
        // Initialize all rooms with empty connection arrays
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                const roomKey = `${x},${y}`;
                connections[roomKey] = [];
            }
        }
        
        // Generate a maze-like structure with some randomness
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
                const roomKey = `${x},${y}`;
                
                // Check each direction
                const directions = [
                    { dx: 0, dy: -1, name: 'north', opposite: 'south' }, // North
                    { dx: 1, dy: 0, name: 'east', opposite: 'west' },   // East
                    { dx: 0, dy: 1, name: 'south', opposite: 'north' }, // South
                    { dx: -1, dy: 0, name: 'west', opposite: 'east' }   // West
                ];
                
                for (const dir of directions) {
                    const newX = x + dir.dx;
                    const newY = y + dir.dy;
                    
                    // Check if the adjacent room is within bounds
                    if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
                        // Add some randomness to connections (70% chance of connection)
                        if (Math.random() < 0.7) {
                            // Add connection from current room to adjacent room
                            connections[roomKey].push(dir.name);
                            
                            // Add reverse connection from adjacent room to current room
                            const adjacentRoomKey = `${newX},${newY}`;
                            connections[adjacentRoomKey].push(dir.opposite);
                        }
                    }
                }
            }
        }
        
        // Ensure starting room has at least one exit
        if (connections['0,0'].length === 0) {
            connections['0,0'].push('east');
            connections['1,0'].push('west');
        }
        
        return connections;
    }
    
    loadCurrentRoomAlien() {
        const roomKey = `${this.playerRoom.x},${this.playerRoom.y}`;

        // Don't create aliens in the starting room (0,0)
        if (roomKey === '0,0') {
            this.currentRoomAlien = null;
            return;
        }

        // Create alien if it doesn't exist for this room
        if (!this.aliens[roomKey]) {
            this.aliens[roomKey] = createAlienForRoom(roomKey, this.ROOM_SIZE, this.WALL_THICKNESS);
        }

        this.currentRoomAlien = this.aliens[roomKey];
    }
    
    loadCurrentRoomDougBar() {
        const roomKey = `${this.playerRoom.x},${this.playerRoom.y}`;
        
        // Create Doug Bar if it doesn't exist for this room and passes probability check
        if (!this.dougBars.hasOwnProperty(roomKey)) {
            if (Math.random() < .5) {
                this.dougBars[roomKey] = createDougBarForRoom(roomKey, this.ROOM_SIZE, this.WALL_THICKNESS);
            } else {
                this.dougBars[roomKey] = null;
            }
        }
        
        this.currentRoomDougBar = this.dougBars[roomKey];
    }
    
    initializeWarpCore() {
        // Randomly choose between (4,2) and (2,4) for warp core location
        const warpCoreLocations = ['4,2', '2,4'];
        const chosenLocation = warpCoreLocations[Math.floor(Math.random() * warpCoreLocations.length)];
        this.warpCore = createWarpCore(chosenLocation, this.ROOM_SIZE, this.WALL_THICKNESS);
    }
    
    loadCurrentRoomWarpCore() {
        const roomKey = `${this.playerRoom.x},${this.playerRoom.y}`;
        this.currentRoomWarpCore = (this.warpCore && this.warpCore.roomKey === roomKey) ? this.warpCore : null;
    }
    
    triggerVictory() {
        this.gameOver = true;
        this.score += 1000; // Big points for destroying the warp core
        this.soundManager.play('warpCoreDestroy');
        
        // Start victory sequence after 2 seconds
        setTimeout(() => {
            this.slideshow.startVictorySequence();
        }, 2000);
    }
    
    triggerDefeat() {
        this.gameOver = true;
        this.soundManager.play('alienDeath'); // Reuse alien death sound for now
        
        // Start defeat sequence after 1 second
        setTimeout(() => {
            this.slideshow.startDefeatSequence();
        }, 1000);
    }
    
    updateWarpCore() {
        if (this.currentRoomWarpCore && !this.currentRoomWarpCore.destroyed) {
            // Check collision with blasters
            for (let i = this.blasters.length - 1; i >= 0; i--) {
                const blaster = this.blasters[i];
                if (this.currentRoomWarpCore.checkCollision(blaster.x, blaster.y, this.BLASTER_SIZE)) {
                    // Destroy warp core and end game
                    this.blasters.splice(i, 1);
                    this.currentRoomWarpCore.destroyed = true;
                    this.triggerVictory();
                    break;
                }
            }
        }
    }
    
    updateDougBars() {
        if (this.currentRoomDougBar && !this.currentRoomDougBar.collected) {
            // Check collision with player
            if (this.currentRoomDougBar.checkCollision(this.playerX, this.playerY, this.PLAYER_SIZE)) {
                this.currentRoomDougBar.collected = true;
                this.score += 25; // Award points for collecting Doug Bar
                this.soundManager.play('dougBarCollect');
            }
        }
    }
    
    updateAliens() {
        if (this.currentRoomAlien) {
            this.currentRoomAlien.update(this.ROOM_SIZE, this.WALL_THICKNESS);
            
            // Check collision with player
            if (this.currentRoomAlien.checkCollision(this.playerX, this.playerY, this.PLAYER_SIZE, true)) {
                this.triggerDefeat();
            }
            
            // Check collision with blasters
            for (let i = this.blasters.length - 1; i >= 0; i--) {
                const blaster = this.blasters[i];
                if (this.currentRoomAlien.checkCollision(blaster.x, blaster.y, this.BLASTER_SIZE)) {
                    // Remove blaster and alien, award points
                    this.blasters.splice(i, 1);
                    this.currentRoomAlien = null;
                    delete this.aliens[`${this.playerRoom.x},${this.playerRoom.y}`];
                    this.score += 50;
                    this.soundManager.play('alienDeath');
                    break;
                }
            }
        }
    }
    

    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Fire blaster on spacebar
            if (e.code === 'Space') {
                e.preventDefault(); // Prevent page scrolling
                this.fireBlaster();
            }
            
            // Victory sequence hotkey
            if (e.key.toLowerCase() === 'v' && !this.gameOver) {
                this.triggerVictory();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    setupResize() {
        window.addEventListener('resize', () => {
            this.ROOM_SIZE = Math.min(window.innerWidth, window.innerHeight);
            this.PLAYER_SIZE = Math.max(8, Math.floor(this.ROOM_SIZE / 50));
            this.WALL_THICKNESS = Math.max(20, Math.floor(this.ROOM_SIZE / 20));
            this.DOOR_SIZE = Math.max(80, Math.floor(this.ROOM_SIZE * 0.2));
            
            // Update canvas size
            this.canvas.width = this.ROOM_SIZE;
            this.canvas.height = this.ROOM_SIZE;
            
            // Keep player in bounds after resize
            this.playerX = Math.min(Math.max(this.playerX, this.PLAYER_SIZE/2), this.ROOM_SIZE - this.PLAYER_SIZE/2);
            this.playerY = Math.min(Math.max(this.playerY, this.PLAYER_SIZE/2), this.ROOM_SIZE - this.PLAYER_SIZE/2);
        });
        
        // Set initial canvas size
        this.canvas.width = this.ROOM_SIZE;
        this.canvas.height = this.ROOM_SIZE;
    }
    
    updatePlayer() {
        const moveIncrement = 10;
        let deltaX = 0;
        let deltaY = 0;
        
        if (this.keys['w']) {
            deltaY -= 1;
        }
        if (this.keys['s']) {
            deltaY += 1;
        }
        if (this.keys['a']) {
            deltaX -= 1;
        }
        if (this.keys['d']) {
            deltaX += 1
        }

        if (deltaX || deltaY) {
            this.lastMoveDirection = {x: deltaX, y: deltaY};
        }

        // Check wall collisions
        let newX = this.playerX + deltaX * moveIncrement;
        let newY = this.playerY + deltaY * moveIncrement;
        if (this.canMoveTo(newX, newY)) {
            this.playerX = newX;
            this.playerY = newY;
        }
        
        this.checkRoomTransition();
    }
    
    fireBlaster() {
        // Only fire if player has moved (has a direction)
        if (this.blasters.length >= 2) {
            return;
        }
        const blaster = {
            x: this.playerX,
            y: this.playerY,
            dx: this.lastMoveDirection.x * this.BLASTER_SPEED,
            dy: this.lastMoveDirection.y * this.BLASTER_SPEED,
            room: { x: this.playerRoom.x, y: this.playerRoom.y }
        };
        
        this.blasters.push(blaster);
        this.soundManager.play('gunFire');
    }
    
    updateBlasters() {
        for (let i = this.blasters.length - 1; i >= 0; i--) {
            const blaster = this.blasters[i];
            
            // Move blaster
            blaster.x += blaster.dx;
            blaster.y += blaster.dy;
            
            // Check if blaster is still in the same room
            if (blaster.room.x !== this.playerRoom.x || blaster.room.y !== this.playerRoom.y) {
                // Remove blaster if it's in a different room
                this.blasters.splice(i, 1);
                continue;
            }
            
            // Check wall collision
            if (!this.canMoveTo(blaster.x, blaster.y)) {
                // Remove blaster when it hits a wall
                this.blasters.splice(i, 1);
                continue;
            }
            
            // Remove blaster if it goes out of bounds
            if (blaster.x < 0 || blaster.x > this.ROOM_SIZE || 
                blaster.y < 0 || blaster.y > this.ROOM_SIZE) {
                this.blasters.splice(i, 1);
            }
        }
    }
    
    canMoveTo(x, y) {
        // Check if player is within room bounds
        if (x < this.PLAYER_SIZE/2 || x > this.ROOM_SIZE - this.PLAYER_SIZE/2 ||
            y < this.PLAYER_SIZE/2 || y > this.ROOM_SIZE - this.PLAYER_SIZE/2) {
            return false;
        }
        
        // Check wall collisions
        const wallThickness = this.WALL_THICKNESS;
        const doorSize = this.DOOR_SIZE;
        const doorStart = (this.ROOM_SIZE - doorSize) / 2;
        const doorEnd = doorStart + doorSize;
        
        // Check if player is hitting a wall (not a door)
        const roomKey = `${this.playerRoom.x},${this.playerRoom.y}`;
        const connections = this.roomConnections[roomKey];
        
        // North wall - check if player is in the door opening
        if (y < wallThickness) {
            if (!connections.includes('north')) {
                return false; // Solid wall
            } else {
                // Check if player is in the door opening
                if (x < doorStart || x > doorEnd) {
                    return false; // Player is hitting the wall, not the door
                }
            }
        }
        
        // South wall - check if player is in the door opening
        if (y > this.ROOM_SIZE - wallThickness) {
            if (!connections.includes('south')) {
                return false; // Solid wall
            } else {
                // Check if player is in the door opening
                if (x < doorStart || x > doorEnd) {
                    return false; // Player is hitting the wall, not the door
                }
            }
        }
        
        // West wall - check if player is in the door opening
        if (x < wallThickness) {
            if (!connections.includes('west')) {
                return false; // Solid wall
            } else {
                // Check if player is in the door opening
                if (y < doorStart || y > doorEnd) {
                    return false; // Player is hitting the wall, not the door
                }
            }
        }
        
        // East wall - check if player is in the door opening
        if (x > this.ROOM_SIZE - wallThickness) {
            if (!connections.includes('east')) {
                return false; // Solid wall
            } else {
                // Check if player is in the door opening
                if (y < doorStart || y > doorEnd) {
                    return false; // Player is hitting the wall, not the door
                }
            }
        }
        
        return true;
    }
    
    checkRoomTransition() {
        const roomKey = `${this.playerRoom.x},${this.playerRoom.y}`;
        const connections = this.roomConnections[roomKey];
        const oldRoomX = this.playerRoom.x;
        const oldRoomY = this.playerRoom.y;
        
        // Check if player is at a door and should transition
        if (this.playerX < this.WALL_THICKNESS && connections.includes('west')) {
            // Moving west to previous room
            this.playerRoom.x--;
            this.playerX = this.ROOM_SIZE - this.WALL_THICKNESS - this.PLAYER_SIZE/2;
        } else if (this.playerX > this.ROOM_SIZE - this.WALL_THICKNESS && connections.includes('east')) {
            // Moving east to next room
            this.playerRoom.x++;
            this.playerX = this.WALL_THICKNESS + this.PLAYER_SIZE/2;
        } else if (this.playerY < this.WALL_THICKNESS && connections.includes('north')) {
            // Moving north to previous room
            this.playerRoom.y--;
            this.playerY = this.ROOM_SIZE - this.WALL_THICKNESS - this.PLAYER_SIZE/2;
        } else if (this.playerY > this.ROOM_SIZE - this.WALL_THICKNESS && connections.includes('south')) {
            // Moving south to next room
            this.playerRoom.y++;
            this.playerY = this.WALL_THICKNESS + this.PLAYER_SIZE/2;
        }
        
        // If room changed, load the alien, Doug Bar, and warp core for the new room
        if (oldRoomX !== this.playerRoom.x || oldRoomY !== this.playerRoom.y) {
            this.loadCurrentRoomAlien();
            this.loadCurrentRoomDougBar();
            this.loadCurrentRoomWarpCore();
        }
    }
    

    
    drawRoom() {
        const roomKey = `${this.playerRoom.x},${this.playerRoom.y}`;
        const roomIndex = (this.playerRoom.x + this.playerRoom.y * 10) % AtariColors.length;
        const roomColor = AtariColors[roomIndex];
        
        // Fill room with grey background
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(0, 0, this.ROOM_SIZE, this.ROOM_SIZE);
        
        // Draw walls
        this.drawWalls(roomKey, roomColor);
        
        // Draw warp core
        if (this.currentRoomWarpCore) {
            this.currentRoomWarpCore.draw(this.ctx);
        }
        
        // Draw Doug Bar
        if (this.currentRoomDougBar && !this.currentRoomDougBar.collected) {
            this.currentRoomDougBar.draw(this.ctx);
        }
        
        // Draw aliens
        if (this.currentRoomAlien) {
            this.currentRoomAlien.draw(this.ctx);
        }
        
        // Draw player
        this.drawPlayer();
        
        // Draw blasters
        this.drawBlasters();
        
        // Draw score
        ScoreDisplay.drawScore(this.ctx, this.score);
    }
    
    drawWalls(roomKey, roomColor) {
        const connections = this.roomConnections[roomKey];
        const wallThickness = this.WALL_THICKNESS;
        const doorSize = this.DOOR_SIZE;
        const doorStart = (this.ROOM_SIZE - doorSize) / 2;
        
        this.ctx.fillStyle = roomColor;
        
        // North wall
        if (!connections.includes('north')) {
            this.ctx.fillRect(0, 0, this.ROOM_SIZE, wallThickness);
        } else {
            // Draw wall with door
            this.ctx.fillRect(0, 0, doorStart, wallThickness);
            this.ctx.fillRect(doorStart + doorSize, 0, this.ROOM_SIZE - doorStart - doorSize, wallThickness);
        }
        
        // South wall
        if (!connections.includes('south')) {
            this.ctx.fillRect(0, this.ROOM_SIZE - wallThickness, this.ROOM_SIZE, wallThickness);
        } else {
            // Draw wall with door
            this.ctx.fillRect(0, this.ROOM_SIZE - wallThickness, doorStart, wallThickness);
            this.ctx.fillRect(doorStart + doorSize, this.ROOM_SIZE - wallThickness, this.ROOM_SIZE - doorStart - doorSize, wallThickness);
        }
        
        // West wall
        if (!connections.includes('west')) {
            this.ctx.fillRect(0, 0, wallThickness, this.ROOM_SIZE);
        } else {
            // Draw wall with door
            this.ctx.fillRect(0, 0, wallThickness, doorStart);
            this.ctx.fillRect(0, doorStart + doorSize, wallThickness, this.ROOM_SIZE - doorStart - doorSize);
        }
        
        // East wall
        if (!connections.includes('east')) {
            this.ctx.fillRect(this.ROOM_SIZE - wallThickness, 0, wallThickness, this.ROOM_SIZE);
        } else {
            // Draw wall with door
            this.ctx.fillRect(this.ROOM_SIZE - wallThickness, 0, wallThickness, doorStart);
            this.ctx.fillRect(this.ROOM_SIZE - wallThickness, doorStart + doorSize, wallThickness, this.ROOM_SIZE - doorStart - doorSize);
        }
    }
    
    drawPlayer() {
        this.ctx.fillStyle = '#FFFF00'; // Yellow player
        this.ctx.fillRect(
            this.playerX - this.PLAYER_SIZE/2,
            this.playerY - this.PLAYER_SIZE/2,
            this.PLAYER_SIZE,
            this.PLAYER_SIZE
        );
    }
    
    drawBlasters() {
        this.ctx.fillStyle = '#FF0000'; // Red blasters
        for (const blaster of this.blasters) {
            this.ctx.fillRect(
                blaster.x - this.BLASTER_SIZE/2,
                blaster.y - this.BLASTER_SIZE/2,
                this.BLASTER_SIZE,
                this.BLASTER_SIZE
            );
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulator += deltaTime;
        
        // Update at fixed timestep (30 FPS)
        while (this.accumulator >= this.frameTime) {
            if (!this.gameOver) {
                this.updatePlayer();
                this.updateBlasters();
                this.updateAliens();
                this.updateDougBars();
                this.updateWarpCore();
            }
            this.accumulator -= this.frameTime;
        }
        
        // Render every frame
        this.drawRoom();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}
