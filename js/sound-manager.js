// Sound effect management system
class SoundManager {
    constructor() {
        // Initialize sound cache
        this.sounds = {};
        
        // Define available sound effects
        this.soundEffects = {
            dougBarCollect: 'sounds/doug-bar.mp3',
            gunFire: 'sounds/gun.mp3',
            alienDeath: 'sounds/short-explosion.mp3'
        };
        
        // Preload all sounds
        this.preloadSounds();
    }
    
    preloadSounds() {
        for (const [name, path] of Object.entries(this.soundEffects)) {
            const audio = new Audio(path);
            this.sounds[name] = audio;
        }
    }
    
    play(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            // Create a new Audio instance for overlapping sounds
            const soundClone = sound.cloneNode();
            soundClone.play().catch(error => {
                console.warn(`Failed to play sound ${soundName}:`, error);
            });
        } else {
            console.warn(`Sound ${soundName} not found`);
        }
    }
    
    // Add a new sound effect at runtime
    addSound(name, path) {
        this.soundEffects[name] = path;
        const audio = new Audio(path);
        this.sounds[name] = audio;
    }
}
