// Score display system for the adventure game
class ScoreDisplay {
    constructor() {
        // No initialization needed
    }
    
    static drawBlockyDigit(ctx, digit, x, y, size) {
        const blockSize = size / 5; // Each digit is 3x5 blocks
        
        // Define digit patterns (3x5 grid, 1 = filled block, 0 = empty)
        const patterns = {
            '0': [
                [1,1,1],
                [1,0,1],
                [1,0,1],
                [1,0,1],
                [1,1,1]
            ],
            '1': [
                [0,1,0],
                [1,1,0],
                [0,1,0],
                [0,1,0],
                [1,1,1]
            ],
            '2': [
                [1,1,1],
                [0,0,1],
                [1,1,1],
                [1,0,0],
                [1,1,1]
            ],
            '3': [
                [1,1,1],
                [0,0,1],
                [1,1,1],
                [0,0,1],
                [1,1,1]
            ],
            '4': [
                [1,0,1],
                [1,0,1],
                [1,1,1],
                [0,0,1],
                [0,0,1]
            ],
            '5': [
                [1,1,1],
                [1,0,0],
                [1,1,1],
                [0,0,1],
                [1,1,1]
            ],
            '6': [
                [1,1,1],
                [1,0,0],
                [1,1,1],
                [1,0,1],
                [1,1,1]
            ],
            '7': [
                [1,1,1],
                [0,0,1],
                [0,0,1],
                [0,0,1],
                [0,0,1]
            ],
            '8': [
                [1,1,1],
                [1,0,1],
                [1,1,1],
                [1,0,1],
                [1,1,1]
            ],
            '9': [
                [1,1,1],
                [1,0,1],
                [1,1,1],
                [0,0,1],
                [1,1,1]
            ]
        };
        
        const pattern = patterns[digit];
        if (!pattern) return;
        
        ctx.fillStyle = '#8000FF'; // Purple text
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 3; col++) {
                if (pattern[row][col]) {
                    ctx.fillRect(
                        x + col * blockSize,
                        y + row * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            }
        }
    }
    
    static drawScore(ctx, score) {
        const scoreStr = score.toString().padStart(6, '0'); // Pad to 6 digits
        const digitSize = 40; // Size of each digit
        const digitSpacing = digitSize * 0.8; // Space between digits
        const startX = 20; // Left margin
        const startY = 0; // Top margin
        
        // Draw score digits (no label)
        for (let i = 0; i < scoreStr.length; i++) {
            ScoreDisplay.drawBlockyDigit(
                ctx,
                scoreStr[i],
                startX + i * digitSpacing,
                startY,
                digitSize
            );
        }
    }
}
