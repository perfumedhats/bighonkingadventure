// Alien types and behaviors for the adventure game
class Alien {
    constructor(x, y, roomKey, type) {
        this.x = x;
        this.y = y;
        this.roomKey = roomKey;
        this.type = type;
        this.size = 16;
        this.speed = 1;
        this.direction = { x: 0, y: 0 };
        this.changeDirectionTimer = 0;
        this.changeDirectionInterval = 30 + Math.random() * 60; // 1-3 seconds at 30fps
        
        // Set initial random direction
        this.setRandomDirection();
        
        // Type-specific properties
        this.setupTypeProperties();
    }
    
    setupTypeProperties() {
        switch(this.type) {
            case 'bat':
                this.color = '#8000FF'; // Purple
                this.speed = 9;
                this.size = 12;
                break;
            case 'dragon':
                this.color = '#FF0000'; // Red
                this.speed = 4;
                this.size = 20;
                break;
            case 'snake':
                this.color = '#00FF00'; // Green
                this.speed = 2;
                this.size = 14;
                break;
        }
    }
    
    setRandomDirection() {
        if (this.type === 'snake') {
            // Snakes only move diagonally
            const diagonalDirections = [
                { x: 1, y: 1 },   // Southeast
                { x: -1, y: 1 },  // Southwest
                { x: 1, y: -1 },  // Northeast
                { x: -1, y: -1 }, // Northwest
            ];
            this.direction = diagonalDirections[Math.floor(Math.random() * diagonalDirections.length)];
        } else {
            // Other aliens use cardinal directions
            const directions = [
                { x: 0, y: -1 }, // North
                { x: 1, y: 0 },  // East
                { x: 0, y: 1 },  // South
                { x: -1, y: 0 }, // West
                { x: 0, y: 0 }   // Stop occasionally
            ];
            this.direction = directions[Math.floor(Math.random() * directions.length)];
        }
    }
    
    update(roomSize, wallThickness, playerX, playerY) {
        const margin = this.size / 2;

        if (this.type === 'dragon') {
            // Red dragons move toward player using 8-directional movement
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            
            // Add a small threshold to prevent tiny movements
            const threshold = 2;
            
            // Calculate normalized direction with diagonal adjustment
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length > threshold) {
                // Normalize to 8 directions
                const normalizedDx = dx / length;
                const normalizedDy = dy / length;
                
                // Convert to -1, 0, or 1 based on 45-degree angles
                this.direction.x = Math.abs(normalizedDx) > 0.382 ? Math.sign(dx) : 0;
                this.direction.y = Math.abs(normalizedDy) > 0.382 ? Math.sign(dy) : 0;
                
                // If we're not moving in either direction, force the dominant one
                if (this.direction.x === 0 && this.direction.y === 0) {
                    if (Math.abs(dx) > Math.abs(dy)) {
                        this.direction.x = Math.sign(dx);
                    } else {
                        this.direction.y = Math.sign(dy);
                    }
                }
            }
        } else {
            // Other aliens use original random movement
            this.changeDirectionTimer++;
            if (this.changeDirectionTimer >= this.changeDirectionInterval) {
                this.setRandomDirection();
                this.changeDirectionTimer = 0;
                this.changeDirectionInterval = 30 + Math.random() * 60; // 1-3 seconds at 30fps
            }
        }
        
        // Move alien
        const newX = this.x + this.direction.x * this.speed;
        const newY = this.y + this.direction.y * this.speed;
        
        // Check boundaries and bounce off walls
        if (newX < wallThickness + margin || newX > roomSize - wallThickness - margin) {
            this.direction.x *= -1;
        } else {
            this.x = newX;
        }
        
        if (newY < wallThickness + margin || newY > roomSize - wallThickness - margin) {
            this.direction.y *= -1;
        } else {
            this.y = newY;
        }
        
        // Keep alien in bounds
        this.x = Math.max(wallThickness + margin, Math.min(this.x, roomSize - wallThickness - margin));
        this.y = Math.max(wallThickness + margin, Math.min(this.y, roomSize - wallThickness - margin));
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        
        switch(this.type) {
            case 'bat':
                this.drawBat(ctx);
                break;
            case 'dragon':
                this.drawDragon(ctx);
                break;
            case 'snake':
                this.drawSnake(ctx);
                break;
        }
    }
    
    drawBat(ctx) {
        // Simple bat shape - diamond with wing extensions
        const halfSize = this.size / 2;
        
        // Main body (diamond)
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - halfSize);
        ctx.lineTo(this.x + halfSize, this.y);
        ctx.lineTo(this.x, this.y + halfSize);
        ctx.lineTo(this.x - halfSize, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Wings
        ctx.fillRect(this.x - halfSize - 4, this.y - 3, 8, 6);
        ctx.fillRect(this.x + halfSize - 4, this.y - 3, 8, 6);
    }
    
    drawDragon(ctx) {
        // Dragon shape - larger rectangle with spikes
        const halfSize = this.size / 2;
        
        // Main body
        ctx.fillRect(this.x - halfSize, this.y - halfSize, this.size, this.size);
        
        // Spikes/horns
        ctx.fillRect(this.x - halfSize + 2, this.y - halfSize - 4, 4, 4);
        ctx.fillRect(this.x + halfSize - 6, this.y - halfSize - 4, 4, 4);
        
        // Tail
        ctx.fillRect(this.x + halfSize, this.y - 2, 6, 4);
    }
    
    drawSnake(ctx) {
        // Snake shape - segmented rectangles
        const segmentSize = 4;
        const segments = Math.floor(this.size / segmentSize);
        
        for (let i = 0; i < segments; i++) {
            const offsetX = (i - segments/2) * segmentSize;
            ctx.fillRect(
                this.x + offsetX - segmentSize/2,
                this.y - segmentSize/2,
                segmentSize,
                segmentSize
            );
        }
    }
    
    checkCollision(otherX, otherY, otherSize, isPlayer = false) {
        const dx = this.x - otherX;
        const dy = this.y - otherY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Use 50% larger hit box for player collisions
        const hitBoxMultiplier = isPlayer ? 1.5 : 1;
        return distance < (this.size + otherSize) * hitBoxMultiplier / 2;
    }
}

// Alien management utilities
const AlienTypes = ['bat', 'dragon', 'snake'];

function getAlienTypeForRoom(roomX, roomY) {
    // Deterministic alien type based on room coordinates
    const roomIndex = (roomX * 7 + roomY * 11) % 3; // Use prime numbers for better distribution
    return AlienTypes[roomIndex];
}

function createAlienForRoom(roomKey, roomSize, wallThickness) {
    const [roomX, roomY] = roomKey.split(',').map(Number);
    const alienType = getAlienTypeForRoom(roomX, roomY);
    
    // Random position within room bounds
    const margin = 30;
    const x = wallThickness + margin + Math.random() * (roomSize - 2 * (wallThickness + margin));
    const y = wallThickness + margin + Math.random() * (roomSize - 2 * (wallThickness + margin));
    
    return new Alien(x, y, roomKey, alienType);
}
