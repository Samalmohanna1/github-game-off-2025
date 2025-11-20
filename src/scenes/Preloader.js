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
                "A SleepySam Game",
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

        this.load.spritesheet("adultWalk", "animations/adult-walk.png", {
            frameWidth: 250,
            frameHeight: 250,
        });
    }

    create() {
        //  When all the assets have loaded, Spritesheet animations that are used in the game can be made here.
        this.anims.create({
            key: "pathWalk",
            frames: [
                { key: "walkFrame1" },
                { key: "walkFrame2" },
                { key: "walkFrame3" },
                { key: "walkFrame4" },
            ],
            frameRate: 8,
            repeat: 1,
        });
        this.anims.create({
            key: "bugWalk",
            frames: this.anims.generateFrameNumbers("adultWalk", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
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
