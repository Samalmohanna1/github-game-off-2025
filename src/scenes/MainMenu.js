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

        new Button(this, 720, 1350, {
            targetScene: "Tutorial",
        });
    }
}
