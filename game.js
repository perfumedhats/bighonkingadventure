// Slideshow system
class Slideshow {
    constructor() {
        this.images = [
            'images/title.png',
            'images/fighter-bob.png', 
            'images/admiral2.png'
        ];
        this.currentIndex = 0;
        this.viewport = document.getElementById('viewport');
        this.openingSlideshow = document.getElementById('opening-slideshow');
        this.gameCanvas = document.getElementById('gameCanvas');
        this.gameContainer = document.getElementById('game-container');
        this.backgroundMusic = document.getElementById('background-music');
        
        this.setupInput();
        this.updateImage();
        this.startMusic();
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault(); // Prevent page scrolling
                this.nextImage();
            }
        });
    }
    
    nextImage() {
        this.currentIndex++;
        
        if (this.currentIndex >= this.images.length) {
            // Start the game
            this.startGame();
        } else {
            this.updateImage();
        }
    }
    
    updateImage() {
        this.viewport.src = this.images[this.currentIndex];
    }
    
    startMusic() {
        // Start background music
        this.backgroundMusic.play().catch(error => {
            console.log('Audio autoplay failed:', error);
            // Music will start on first user interaction
        });
    }
    
    stopMusic() {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
    }
    
    startGame() {
        // Stop the background music
        this.stopMusic();
        
        // Hide slideshow and show game
        this.openingSlideshow.style.display = 'none';
        this.gameCanvas.style.display = 'block';
        
        // Start the game
        new AdventureGame();
    }
}

// Atari Adventure Game
class AdventureGame {
    constructor() {
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
        
        // Atari 2600 color palette (approximated for web)
        this.atariColors = [
            '#000000', // Black
            '#FFFFFF', // White
            '#FF0000', // Red
            '#00FF00', // Green
            '#0000FF', // Blue
            '#FFFF00', // Yellow
            '#FF00FF', // Magenta
            '#00FFFF', // Cyan
            '#FF8000', // Orange
            '#8000FF', // Purple
            '#008000', // Dark Green
            '#800000', // Dark Red
            '#000080', // Dark Blue
            '#808000', // Olive
            '#800080', // Dark Magenta
            '#008080', // Dark Cyan
            '#FF8080', // Light Red
            '#80FF80', // Light Green
            '#8080FF', // Light Blue
            '#FFFF80', // Light Yellow
            '#FF80FF', // Light Magenta
            '#80FFFF', // Light Cyan
            '#FFC080', // Light Orange
            '#C080FF', // Light Purple
            '#80C080', // Light Green
            '#C08080', // Light Red
            '#8080C0', // Light Blue
            '#C0C080', // Light Olive
            '#C080C0', // Light Magenta
            '#80C0C0', // Light Cyan
            '#FFE0C0', // Very Light Orange
            '#E0C0FF', // Very Light Purple
            '#C0E0C0', // Very Light Green
            '#E0C0E0', // Very Light Magenta
            '#C0E0E0', // Very Light Cyan
            '#FFFFC0', // Very Light Yellow
            '#FFC0FF', // Very Light Magenta
            '#C0FFFF', // Very Light Cyan
            '#FFE0E0', // Very Light Red
            '#E0FFE0', // Very Light Green
            '#E0E0FF', // Very Light Blue
            '#E0E0E0', // Very Light Gray
            '#C0C0C0', // Light Gray
            '#808080', // Gray
            '#404040', // Dark Gray
            '#202020', // Very Dark Gray
            '#101010', // Almost Black
            '#FF4000', // Bright Orange
            '#FF0040', // Bright Pink
            '#40FF00', // Bright Lime
            '#00FF40', // Bright Green
            '#0040FF', // Bright Blue
            '#4000FF', // Bright Purple
            '#FF8000', // Orange
            '#FF0080', // Pink
            '#80FF00', // Lime
            '#00FF80', // Green
            '#0080FF', // Blue
            '#8000FF'  // Purple
        ];
        
        // Room connections - hardcoded map
        // Each room can connect to up to 4 adjacent rooms (north, south, east, west)
        this.roomConnections = this.generateRoomConnections();
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Handle window resize
        this.setupResize();
        
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
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
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
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
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
        let newX = this.playerX;
        let newY = this.playerY;
        
        // Handle movement with 10px increments
        if (this.keys['w'] || this.keys['arrowup']) {
            newY -= moveIncrement;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            newY += moveIncrement;
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            newX -= moveIncrement;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            newX += moveIncrement;
        }
        
        // Check wall collisions
        if (this.canMoveTo(newX, newY)) {
            this.playerX = newX;
            this.playerY = newY;
        }
        
        // Check room transitions
        this.checkRoomTransition();
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
    }
    

    
    drawRoom() {
        const roomKey = `${this.playerRoom.x},${this.playerRoom.y}`;
        const roomIndex = (this.playerRoom.x + this.playerRoom.y * 10) % this.atariColors.length;
        const roomColor = this.atariColors[roomIndex];
        
        // Fill room with grey background
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(0, 0, this.ROOM_SIZE, this.ROOM_SIZE);
        
        // Draw walls
        this.drawWalls(roomKey, roomColor);
        
        // Draw player
        this.drawPlayer();
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
    
    gameLoop() {
        this.updatePlayer();
        this.drawRoom();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the slideshow when the page loads
window.addEventListener('load', () => {
    new Slideshow();
});
