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

        if (this.wavesCompleted > 0) {
            this.wavesCompleted -= 1;
        }

        this.add
            .image(globals.centerX, globals.centerY, "gameOverBg")
            .setOrigin(0.5);

        this.add.text(
            300,
            750,
            `Score: -----------------> ${this.finalScore}`,
            {
                ...globals.bodyTextStyle,
                fontSize: "52px",
                fontStyle: "700",
            }
        );

        this.add.text(
            300,
            900,
            `Waves Survived: ----->  ${this.wavesCompleted}`,
            {
                ...globals.bodyTextStyle,
                fontSize: "52px",
                fontStyle: "700",
            }
        );

        this.add.text(300, 1050, `Bugs Smashed: ------>  ${this.bugsSmashed}`, {
            ...globals.bodyTextStyle,
            fontSize: "52px",
            fontStyle: "700",
        });

        new Button(this, 720, 1450, "PLAY AGAIN", {
            fillColor: globals.hexNum(globals.colors.yellow500),
            hoverColor: globals.hexNum(globals.colors.yellow600),
            textColor: globals.hexString(globals.colors.black500),
            onClick: () => {
                this.scene.start("GameScene");
            },
        });
    }
}
