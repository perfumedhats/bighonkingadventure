// Doug Bar collectible class
class DougBar {
    constructor(x, y, roomKey) {
        this.x = x;
        this.y = y;
        this.roomKey = roomKey;
        this.width = 30; // 30 pixels wide as specified
        this.height = 10; // 1/3 as tall as it is wide
        this.collected = false;
    }

    draw(ctx) {
        if (this.collected) return;

        // Draw the main bar (pinkish-tan color)
        ctx.fillStyle = '#E6C7B3';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw three peanut inclusions
        ctx.fillStyle = '#8B4513'; // Darker brown for peanuts
        const peanutWidth = 6;
        const peanutHeight = 4;
        const spacing = (this.width - (3 * peanutWidth)) / 4;

        for (let i = 0; i < 3; i++) {
            const peanutX = this.x + spacing + (i * (peanutWidth + spacing));
            const peanutY = this.y + (this.height - peanutHeight) / 2;
            ctx.fillRect(peanutX, peanutY, peanutWidth, peanutHeight);
        }
    }

    checkCollision(playerX, playerY, playerSize) {
        // Use a larger collision box (50% bigger than the actual bar)
        const collisionMargin = 15; // Half the bar width
        return !this.collected &&
            playerX < (this.x + this.width + collisionMargin) &&
            (playerX + playerSize) > (this.x - collisionMargin) &&
            playerY < (this.y + this.height + collisionMargin) &&
            (playerY + playerSize) > (this.y - collisionMargin);
    }
}

// Utility function to create a Doug Bar in a room
function createDougBarForRoom(roomKey, roomSize, wallThickness) {
    // Random position within room bounds, accounting for the bar's size
    const margin = 30;
    const x = wallThickness + margin + Math.random() * (roomSize - 2 * (wallThickness + margin) - 30);
    const y = wallThickness + margin + Math.random() * (roomSize - 2 * (wallThickness + margin) - 10);
    
    return new DougBar(x, y, roomKey);
}
