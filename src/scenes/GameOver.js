import { Scene } from "phaser";
import globals from "../globals";
import { Button } from "../components/Button";

export class GameOver extends Scene {
    constructor() {
        super("GameOver");
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.wavesCompleted = data.wave || 0;
        this.bugsSmashed = data.bugsSmashed || 0;
    }

    create() {
        this.cameras.main.fadeIn(1000);

        this.add.rectangle(
            720,
            960,
            1440,
            1920,
            globals.hexNum(globals.colors.black500)
        );

        const gameOverText = this.add
            .text(720, 400, "GAME OVER", {
                ...globals.bodyTextStyle,
                fontSize: "128px",
                fill: globals.hexString(globals.colors.red500),
            })
            .setOrigin(0.5);

        this.tweens.add({
            targets: gameOverText,
            scale: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        this.add
            .text(720, 800, `Score: ${this.finalScore}`, {
                ...globals.bodyTextStyle,
                fontSize: "64px",
                align: "left",
            })
            .setOrigin(0.5);

        this.add
            .text(720, 900, `Waves Survived: ${this.wavesCompleted - 1}`, {
                ...globals.bodyTextStyle,
                fontSize: "64px",
                align: "left",
            })
            .setOrigin(0.5);

        this.add
            .text(720, 980, `Bugs Smashed: ${this.bugsSmashed}`, {
                ...globals.bodyTextStyle,
                fontSize: "64px",
                align: "left",
            })
            .setOrigin(0.5);

        new Button(this, 720, 1350, "PLAY AGAIN", {
            fillColor: globals.hexNum(globals.colors.yellow500),
            hoverColor: globals.hexNum(globals.colors.yellow600),
            textColor: globals.hexString(globals.colors.black500),
            onClick: () => {
                this.scene.start("GameScene");
            },
        });

        new Button(this, 720, 1520, "MAIN MENU", {
            fillColor: globals.hexNum(globals.colors.blue500),
            hoverColor: globals.hexNum(globals.colors.blue600),
            textColor: globals.hexString(globals.colors.black500),
            onClick: () => {
                this.scene.start("MainMenu");
            },
        });
    }
}

