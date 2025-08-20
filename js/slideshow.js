// Slideshow system
class Slideshow {
    constructor() {
        this.isFinale = false;
        this.slidesVictory = [
            {
                image: 'images/fighter-bob.png',
                text: 'BOB: WAY TO KICK ASS, DOUG!'
            },
            {
                image: 'images/heather.png',
                text: [
                    'HEATHER: THANKS, YOU SAVED THE FAIRY',
                    'GARDEN FROM THE ALIENS!'
                ].join('\n')
            },
            {
                image: 'images/admiral3.png',
                text: [
                    "ADMIRAL: THREE CHEERS FOR DOUG!",
                    "WOOF! WOOF! WOOF!"
                ].join('\n')
            },
            {
                image: 'images/doug-relaxed.png',
                text: [
                    "DOUG: THAT SURE WAS A BIG HONKING",
                    "ADVENTURE"
                ].join('\n')
            },
            {
                image: 'images/alien-defeat.png',
                text: [
                    "THE END... OR IS IT?"
                ].join('\n')
            }
        ];

        this.slidesDefeat = [
            {
                image: 'images/admiral3.png',
                text: [
                    "ADMIRAL: WITHOUT DOUG, HUMANITY",
                    "CANNOT DEFEAT THE ALIENS!"
                ].join('\n')
            },
            {
                image: 'images/bad-ending.png',
                text: [
                    "ALIENS: KLATU BARADA NIKTO*",
                    "TRANSLATION: THE HUMANS ARE DELICIOUS"
                ].join('\n')
            },
            {
                image: 'images/alien-victory.png',
                text: [
                    "THE END... OR IS IT?"
                ].join('\n')
            }
        ];
        
        this.slidesIntro = [
            {
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
                    'EAT ALL THE DELICIOUS DOUG BARS',
                    'YOU CAN FIND'
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
                image: 'images/fighter-bob.png',
                text: [
                    "BOB: CAREFUL DOUG, THAT THING HITS",
                    "LIKE A LOADED GOAT"
                ].join('\n')
            },
            {
                image: 'images/doug-pilot.png',
                text: [
                    "DOUG: NO SWEAT! I'M HERE TO KICK ASS",
                    "AND CHEW DOUG BARS, AND I'M ALL OUT",
                    "OF DOUG BARS"
                ].join('\n')
            }
        ];
        this.slidesCurrent = this.slidesIntro;
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
        
        if (this.currentIndex >= this.slidesCurrent.length) {
            if (!this.isFinale) {
                // Start the game only if not in victory mode
                this.startGame();
                document.removeEventListener('keydown', this.boundSlideshowKeydown);
            } else {
                // In victory mode, stay on last slide
                this.currentIndex--;
            }
        } else {
            this.updateImage();
            this.startTypewriter();
        }
    }
    
    updateImage() {
        this.viewport.src = this.slidesCurrent[this.currentIndex].image;
    }
    
    startTypewriter(text) {
        this.typewriterText.innerHTML = '';
        const textToType = text || this.slidesCurrent[this.currentIndex].text;
        this.typeText(textToType, 0);
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
        this.writingText = true;
        this.currentIndex = 0;

        this.isFinale = true;
        this.slidesCurrent = this.slidesVictory;

        // Hide game canvas first
        this.gameCanvas.style.display = 'none';
        
        // Set up victory slide
        this.updateImage();
        // Show slideshow after image is loaded to prevent flicker
        this.viewport.onload = () => {
            this.openingSlideshow.style.display = 'block';
            this.startTypewriter(this.slidesCurrent[0].text);
            this.viewport.onload = null;
        };
        
        // Restart background music after 2 seconds
        setTimeout(() => {
            this.startMusic();
        }, 2000);
        
        // Re-enable input for victory slides
        document.addEventListener('keydown', this.boundSlideshowKeydown);
    }

    startDefeatSequence() {
        this.writingText = true;
        this.currentIndex = 0;

        this.isFinale = true;
        this.slidesCurrent = this.slidesDefeat;

        // Hide game canvas first
        this.gameCanvas.style.display = 'none';
        
        // Set up victory slide
        this.updateImage();
        // Show slideshow after image is loaded to prevent flicker
        this.viewport.onload = () => {
            this.openingSlideshow.style.display = 'block';
            this.startTypewriter(this.slidesCurrent[0].text);
            this.viewport.onload = null;
        };
        
        // Restart background music after 2 seconds
        setTimeout(() => {
            this.startMusic();
        }, 2000);
        
        // Re-enable input for victory slides
        document.addEventListener('keydown', this.boundSlideshowKeydown);
    }
}
