// Slideshow system
class Slideshow {
    constructor() {
        this.images = [
            'images/title.png',
            'images/fighter-bob.png', 
            'images/admiral2.png',
            'images/doug-bar.png',
            'images/big-honking-gun.png',
            'images/fighter-bob-2.png'
        ];
        this.texts = [
            'PRESS SPACE TO START',
            [   'BOB: HOLY SHIT DOUG, THERE\'S ALIENS',
                'ATTACKING EARTH!'].join('\n'),
            [   'ADMIRAL: DOUG, YOU ARE THE ONLY SPACE',
                'PILOT IN ORBIT! YOU MUST LAND ON THE',
                'ENEMY SHIP AND DISABLE THEIR WARP CORE'
            ].join('\n'),
            [   'YOU CAN RECOVER HEALTH BY EATING',
                'DELICIOUS DOUG BARS'].join('\n'),
            [   "YOU'VE ALSO GOT THE ONLY BIG HONKIN",
                "GUN THAT KEVIN HUGES HASN'T STEPPED ON"
            ].join('\n'),
            [   "BOB: CAREFUL DOUG, THAT THING HITS",
                "LIKE A LOADED GOAT"].join('\n'),
        ];
        this.writingText = true;
        this.currentIndex = 0;
        this.viewport = document.getElementById('viewport');
        this.openingSlideshow = document.getElementById('opening-slideshow');
        this.gameCanvas = document.getElementById('gameCanvas');
        this.gameContainer = document.getElementById('game-container');
        this.backgroundMusic = document.getElementById('background-music');
        this.typewriterText = document.getElementById('typewriter-text');
        
        // Bind the event handler once and store it
        this.boundSlideshowKeydown = this.slideshowKeydown.bind(this);
        
        this.setupInput();
        this.updateImage();
        this.startMusic();
        this.startTypewriter();
    }
    
    slideshowKeydown(e) {
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent page scrolling
            this.nextImage();
        }
    }
    
    setupInput() {
        // This gets removed when the game starts
        document.addEventListener('keydown', this.boundSlideshowKeydown);
    }

    nextImage() {
        if (this.writingText) {
            return;
        }
        
        this.currentIndex++;
        
        if (this.currentIndex >= this.images.length) {
            // Start the game
            this.startGame();
            document.removeEventListener('keydown', this.boundSlideshowKeydown);
        } else {
            this.updateImage();
            this.startTypewriter();
        }
    }
    
    updateImage() {
        this.viewport.src = this.images[this.currentIndex];
    }
    
    startTypewriter() {
        this.typewriterText.innerHTML = '';
        this.typeText(this.texts[this.currentIndex], 0);
    }
    
    typeText(text, index) {
        if (index < text.length) {
            this.writingText = true;
            this.typewriterText.innerHTML = text.substring(0, index + 1) + '<span class="typewriter-cursor"></span>';
            setTimeout(() => this.typeText(text, index + 1), 50); // 50ms delay between characters
        } else {
            // Add blinking cursor at the end
            this.writingText = false;
            this.typewriterText.innerHTML = text + '<span class="typewriter-cursor"></span>';
        }
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
