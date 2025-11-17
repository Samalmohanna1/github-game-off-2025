import globals from "../globals";

export class Button {
    constructor(scene, x, y, text, options = {}) {
        this.scene = scene;

        const defaults = {
            width: 600,
            height: 120,
            fillColor: globals.hexNum(globals.colors.blue500),
            hoverColor: globals.hexNum(globals.colors.blue600),
            strokeColor: globals.hexNum(globals.colors.white500),
            strokeWidth: 6,
            fontSize: "56px",
            textColor: globals.hexString(globals.colors.white500),
            onClick: () => {},
        };

        this.config = { ...defaults, ...options };

        this.rect = scene.add.rectangle(
            x,
            y,
            this.config.width,
            this.config.height,
            this.config.fillColor
        );
        this.rect.setStrokeStyle(
            this.config.strokeWidth,
            this.config.strokeColor
        );
        this.rect.setInteractive({ useHandCursor: true });

        this.text = scene.add
            .text(x, y, text, {
                ...globals.bodyTextStyle,
                fontSize: this.config.fontSize,
                fill: this.config.textColor,
            })
            .setOrigin(0.5);

        this.setupInteractions();
    }

    setupInteractions() {
        this.rect.on("pointerover", () => {
            this.rect.setFillStyle(this.config.hoverColor);
            this.scene.tweens.add({
                targets: [this.rect, this.text],
                scale: 1.02,
                duration: 100,
            });
        });

        this.rect.on("pointerout", () => {
            this.rect.setFillStyle(this.config.fillColor);
            this.scene.tweens.add({
                targets: [this.rect, this.text],
                scale: 1,
                duration: 100,
            });
        });

        this.rect.on("pointerdown", () => {
            this.scene.tweens.add({
                targets: this.rect,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.scene.time.delayedCall(10, () => {
                        this.scene.cameras.main.fadeOut(1000);
                        this.scene.cameras.main.once(
                            "camerafadeoutcomplete",
                            () => {
                                this.config.onClick();
                            }
                        );
                    });
                },
            });
        });
    }

    destroy() {
        this.rect.destroy();
        this.text.destroy();
    }

    setEnabled(enabled) {
        this.rect.setInteractive(enabled);
        this.rect.setAlpha(enabled ? 1 : 0.5);
        this.text.setAlpha(enabled ? 1 : 0.5);
    }
}
