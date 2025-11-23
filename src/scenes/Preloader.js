import { Scene } from "phaser";
import globals from "../globals";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        const logo = this.add.image(
            globals.centerX,
            globals.centerY - 100,
            "studioLogo"
        );
        logo.setOrigin(0.5);
        logo.setRotation(-33);

        this.tweens.add({
            targets: logo,
            y: "+=12",
            duration: 700,
            yoyo: true,
            repeat: -1,
        });

        this.add
            .text(
                globals.centerX,
                globals.centerY + 100,
                "A SLEEPYSAM GAME",
                globals.bodyTextStyle
            )
            .setOrigin(0.5);
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("tutBg", "tut-bg.jpg");
        this.load.image("titleBg", "bgs/title-bg.webp");
        this.load.image("gameOverBg", "bgs/game-over-bg.webp");
        this.load.image("walkFrame1", "bgs/path-1.png");
        this.load.image("walkFrame2", "bgs/path-2.png");
        this.load.image("walkFrame3", "bgs/path-3.png");
        this.load.image("walkFrame4", "bgs/path-4.png");
        this.load.image("adultSmashed", "animations/smashed.png");

        this.load.spritesheet("adultWalk", "animations/adult-walk.png", {
            frameWidth: 250,
            frameHeight: 250,
        });
        this.load.spritesheet("babyWalk", "animations/baby-walk.png", {
            frameWidth: 250,
            frameHeight: 250,
        });
        this.load.spritesheet("darthMaulWalk", "animations/darth-maul.png", {
            frameWidth: 250,
            frameHeight: 250,
        });
        this.load.spritesheet("adultFlutter", "animations/flutter.png", {
            frameWidth: 250,
            frameHeight: 250,
        });

        this.load.audio("city", "audio/city.mp3");
        this.load.audio("bgMusic", "audio/bg-music.mp3");
        this.load.audio("smash", "audio/smash.mp3");
        this.load.audio("gameOver", "audio/game-over.mp3");
        this.load.audio("footsteps", "audio/footsteps.mp3");
        this.load.audio("btnClick", "audio/btn-click.mp3");
    }

    create() {
        this.anims.create({
            key: "pathWalk",
            frames: [
                { key: "walkFrame1" },
                { key: "walkFrame2" },
                { key: "walkFrame3" },
                { key: "walkFrame4" },
            ],
            frameRate: 8,
            repeat: 2,
        });
        this.anims.create({
            key: "adultWalk",
            frames: this.anims.generateFrameNumbers("adultWalk", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "babyWalk",
            frames: this.anims.generateFrameNumbers("babyWalk", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.create({
            key: "darthMaulWalk",
            frames: this.anims.generateFrameNumbers("darthMaulWalk", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
            repeat: -1,
        });
        this.anims.create({
            key: "adultFlutter",
            frames: this.anims.generateFrameNumbers("adultFlutter", {
                start: 0,
                end: 1,
            }),
            frameRate: 12,
            repeat: -1,
        });

        this.time.delayedCall(1000, () => {
            this.cameras.main.fadeOut(1000);
            this.cameras.main.once("camerafadeoutcomplete", () => {
                this.scene.start("MainMenu");
            });
        });
    }
}
