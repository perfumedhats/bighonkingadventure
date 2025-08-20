// Slideshow system
class Slideshow {
    constructor() {
        this.slidesVictory = [{
            image: 'images/fighter-bob.png',
            text: 'BOB: WAY TO KICK ASS, DOUG!'
        }];
        
        this.slides = [{
            image: 'images/title.png',
            text: 'PRESS SPACE TO START'
        },
        {
            image: 'images/fighter-bob.png',
            text: [
                'BOB: HOLY SHIT DOUG, THERE\'S ALIENS',
                'ATTACKING EARTH!'
            ].join('\n')
        },
        {
            image: 'images/admiral2.png',
            text: [
                'ADMIRAL: DOUG, YOU ARE THE ONLY SPACE',
                'PILOT IN ORBIT! YOU MUST LAND ON THE',
                'ENEMY SHIP AND DISABLE THEIR WARP CORE'
            ].join('\n')
        },
        {
            image: 'images/aliens.png',
            text: [
                "BE CAREFUL DOUG, THESE ALIENS",
                "ARE AS DEADLY AS THEY ARE UGLY"
            ].join('\n')
        },
        {
            image: 'images/doug-bar.png',
            text: [
                'YOU CAN RECOVER HEALTH BY EATING',
                'DELICIOUS DOUG BARS'
            ].join('\n')
        },
        {
            image: 'images/big-honking-gun.png',
            text: [
                "YOU'VE ALSO GOT THE ONLY BIG HONKIN",
                "GUN THAT KEVIN HUGES HASN'T STEPPED ON"
            ].join('\n')
        },
        {
            image: 'images/fighter-bob-2.png',
            text: [
                "BOB: CAREFUL DOUG, THAT THING HITS",
                "LIKE A LOADED GOAT"
            ].join('\n')
        }
    ];
        this.slides = [this.slides[0]];
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
        
        if (this.currentIndex >= this.slides.length) {
            // Start the game
            this.startGame();
            document.removeEventListener('keydown', this.boundSlideshowKeydown);
        } else {
            this.updateImage();
            this.startTypewriter();
        }
    }
    
    updateImage() {
        this.viewport.src = this.slides[this.currentIndex].image;
    }
    
    startTypewriter() {
        this.typewriterText.innerHTML = '';
        this.typeText(this.slides[this.currentIndex].text, 0);
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
        new AdventureGame(this);
    }
    
    startVictorySequence() {
        // Switch to victory slides
        this.slides = this.slidesVictory;
        this.currentIndex = 0;
        
        // Show slideshow and hide game
        this.openingSlideshow.style.display = 'block';
        this.gameCanvas.style.display = 'none';
        
        // Reset and start the slideshow
        this.updateImage();
        this.startTypewriter();
        
        // Restart background music after 2 seconds
        setTimeout(() => {
            this.startMusic();
        }, 2000);
        
        // Re-enable input for victory slides
        document.addEventListener('keydown', this.boundSlideshowKeydown);
    }
}
