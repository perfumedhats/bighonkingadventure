// Warp Core - final objective
class WarpCore {
    constructor(x, y, roomKey) {
        this.x = x;
        this.y = y;
        this.roomKey = roomKey;
        this.size = 40; // Make it a bit larger than other objects
        this.destroyed = false;
        this.pulsePhase = 0; // For color pulsing animation
    }

    draw(ctx) {
        if (this.destroyed) return;

        // Update pulse animation
        this.pulsePhase = (this.pulsePhase + 0.1) % (Math.PI * 2);
        const pulseSize = Math.sin(this.pulsePhase) * 5; // Pulsing effect

        // Draw the base (outer ring)
        ctx.fillStyle = '#4488FF';
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, 
                    this.size, this.size);

        // Draw inner core (pulsing)
        const innerSize = this.size - 10 + pulseSize;
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(this.x - innerSize/2, this.y - innerSize/2,
                    innerSize, innerSize);

        // Draw energy patterns
        ctx.fillStyle = '#FFFF00';
        // Horizontal energy bars
        for (let i = 0; i < 3; i++) {
            const barY = this.y - this.size/3 + (i * this.size/3);
            ctx.fillRect(this.x - this.size/2, barY - 2,
                        this.size, 4);
        }
        // Vertical energy bars
        for (let i = 0; i < 3; i++) {
            const barX = this.x - this.size/3 + (i * this.size/3);
            ctx.fillRect(barX - 2, this.y - this.size/2,
                        4, this.size);
        }
    }

    checkCollision(x, y, size) {
        if (this.destroyed) return false;
        
        // Simple rectangular collision detection
        return x < (this.x + this.size/2) &&
               (x + size) > (this.x - this.size/2) &&
               y < (this.y + this.size/2) &&
               (y + size) > (this.y - this.size/2);
    }
}

// Utility function to create a warp core in a room
function createWarpCore(roomKey, roomSize, wallThickness) {
    // Position it in the center of the room
    const x = roomSize / 2;
    const y = roomSize / 2;
    
    return new WarpCore(x, y, roomKey);
}
