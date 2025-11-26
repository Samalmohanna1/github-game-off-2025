import { Scene } from "phaser";
import globals from "../globals";
import AudioManager from "../AudioManager";

export class Tutorial extends Scene {
    constructor() {
        super("Tutorial");
        this.tooltips = [
            {
                text: "Tap bugs to smash them!\nEach smash costs stamina.",
                y: 560,
                bugX: 720,
                bugY: 950,
            },
            {
                text: "Bugs that reach you will stick\nand drain your stamina!",
                y: 1200,
                bugX: 720,
                bugY: 1650,
            },
            {
                text: "Smash bugs quickly for \ncombo bonuses!",
                y: 400,
                combo: true,
            },
        ];
    }

    init() {
        this.tutorialStep = 0;
    }

    create() {
        this.audioManager = new AudioManager(this);

        this.audioManager.playAmbientSound("city", {
            volume: 0.2,
            loop: true,
        });

        this.game.registry.set("audioManager", this.audioManager);
        this.add.rectangle(720, 960, 1440, 1920, 0xf8f6f2);
        this.add
            .image(globals.centerX, globals.centerY, "walkFrame2")
            .setOrigin(0.5);

        this.comboText = this.add
            .text(1400, 80, "3x COMBO", {
                ...globals.bodyTextStyle,
                fontSize: "56px",
                fill: globals.hexString(globals.colors.yellow500),
                stroke: globals.hexString(globals.colors.black600),
                strokeThickness: 4,
            })
            .setOrigin(1, 0)
            .setDepth(100)
            .setAlpha(0);

        this.showTooltip();
    }

    showTooltip() {
        if (this.tutorialStep < this.tooltips.length) {
            const tooltip = this.tooltips[this.tutorialStep];

            const tooltipBg = this.add
                .image(720, tooltip.y, "card")
                .setScale(0.6)
                .setDepth(50)
                .setAlpha(0.9);
            const bug = this.add.sprite(
                tooltip.bugX,
                tooltip.bugY,
                "adultWalk",
                "0"
            );
            bug.setAngle(180);

            const tooltipText = this.add
                .text(720, tooltip.y - 20, tooltip.text, {
                    ...globals.bodyTextStyle,
                    fontSize: "44px",
                    fontStyle: "500",
                    lineSpacing: "20",
                })
                .setOrigin(0.5)
                .setDepth(55);

            const continueText = this.add
                .text(720, tooltip.y + 110, "Tap to continue", {
                    ...globals.bodyTextStyle,
                    fontSize: "36px",
                    fill: globals.hexString(globals.colors.yellow600),
                })
                .setOrigin(0.5)
                .setDepth(55);

            if (tooltip.combo) {
                this.comboText.setScale(1.3).setAlpha(1);
                this.tweens.add({
                    targets: this.comboText,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 400,
                    repeat: -1,
                    yoyo: true,
                });
            }

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
                bug.destroy();
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
