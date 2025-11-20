import { Scene } from "phaser";
import globals from "../globals";

export class Tutorial extends Scene {
    constructor() {
        super("Tutorial");
        this.tooltips = [
            {
                text: "Tap bugs to smash them!\nEach smash costs stamina.",
                y: 960,
            },
            {
                text: "Bugs that reach you will stick\nand drain your stamina!",
                y: 1600,
            },
            {
                text: "Smash bugs quickly for combo bonuses!\nGood luck!",
                y: 400,
            },
        ];
    }

    init() {
        this.tutorialStep = 0;
    }

    create() {
        this.add.rectangle(720, 960, 1440, 1920, 0xf8f6f2);
        this.add
            .image(globals.centerX, globals.centerY, "walkFrame2")
            .setOrigin(0.5);

        this.showTooltip();
    }

    showTooltip() {
        if (this.tutorialStep < this.tooltips.length) {
            const tooltip = this.tooltips[this.tutorialStep];

            const tooltipBg = this.add.rectangle(
                720,
                tooltip.y,
                900,
                250,
                globals.hexNum(globals.colors.black600),
                0.85
            );
            tooltipBg.setStrokeStyle(
                4,
                globals.hexNum(globals.colors.white500)
            );

            const tooltipText = this.add
                .text(720, tooltip.y - 20, tooltip.text, {
                    ...globals.bodyTextStyle,
                    fontSize: "44px",
                })
                .setOrigin(0.5);

            const continueText = this.add
                .text(720, tooltip.y + 90, "Tap to continue", {
                    ...globals.bodyTextStyle,
                    fontSize: "36px",
                    fill: globals.hexString(globals.colors.yellow600),
                })
                .setOrigin(0.5);

            this.tweens.add({
                targets: continueText,
                alpha: 0.3,
                duration: 500,
                yoyo: true,
                repeat: -1,
            });

            this.input.once("pointerdown", () => {
                tooltipBg.destroy();
                tooltipText.destroy();
                continueText.destroy();
                this.tutorialStep++;

                if (this.tutorialStep < this.tooltips.length) {
                    this.showTooltip();
                } else {
                    this.scene.start("GameScene");
                }
            });
        }
    }
}
