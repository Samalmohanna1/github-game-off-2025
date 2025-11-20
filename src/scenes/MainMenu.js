import { Scene } from "phaser";
import { Button } from "../components/Button";
import globals from "../globals";

export class MainMenu extends Scene {
    constructor() {
        super("MainMenu");
    }

    create() {
        this.cameras.main.fadeIn(1000);

        this.add
            .image(globals.centerX, globals.centerY, "titleBg")
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
