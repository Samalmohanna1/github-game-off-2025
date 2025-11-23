export default class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.backgroundMusic = null;
        this.currentAmbientSound = null;
        this.activeSounds = new Map();
    }

    playBackgroundMusic(key, options = { loop: true, volume: 0.5 }) {
        this.stopBackgroundMusic();
        this.backgroundMusic = this.scene.sound.add(key, options);
        this.backgroundMusic.play();
    }

    playSound(key, options = { volume: 1 }) {
        if (options.loop) {
            this.stopSound(key);
            const sound = this.scene.sound.add(key, options);
            this.activeSounds.set(key, sound);
            sound.play();
            return sound;
        } else {
            this.scene.sound.play(key, options);
        }
    }

    stopAmbientSound() {
        if (this.currentAmbientSound) {
            this.currentAmbientSound.stop();
            this.currentAmbientSound = null;
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }

    stopSound(key) {
        const sound = this.activeSounds.get(key);
        if (sound) {
            sound.stop();
            sound.destroy();
            this.activeSounds.delete(key);
        }
    }

    playAmbientSound(key, options = { loop: true, volume: 0.3 }) {
        this.stopAmbientSound();
        this.currentAmbientSound = this.scene.sound.add(key, options);
        this.currentAmbientSound.play();
    }
}
