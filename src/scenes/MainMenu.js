import { Scene } from "phaser";
import { Button } from "../components/Button";
import globals from "../globals";

export class MainMenu extends Scene {
    constructor() {
        super("MainMenu");
    }

    create() {
        this.cameras.main.fadeIn(1000);

        this.add.rectangle(
            720,
            960,
            1440,
            1920,
            globals.hexNum(globals.colors.white600)
        );

        this.add
            .text(720, 300, "Dangerous Bug!", {
                ...globals.bodyTextStyle,
                wordWrap: globals.wordWrap.lg,
                fontSize: "128px",
                fill: globals.hexString(globals.colors.red600),
                stroke: globals.hexString(globals.colors.black600),
                strokeThickness: 8,
            })
            .setOrigin(0.5);

        new Button(this, 720, 1350, "Start Game", {
            fillColor: globals.hexNum(globals.colors.yellow500),
            hoverColor: globals.hexNum(globals.colors.yellow600),
            textColor: globals.hexString(globals.colors.black500),
            onClick: () => {
                this.scene.start("Tutorial");
            },
        });
    }
}

