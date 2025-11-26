export class Button {
    constructor(scene, x, y, options = {}) {
        this.scene = scene;

        const defaults = {
            targetScene: null,
            onClick: () => {},
        };

        this.config = { ...defaults, ...options };

        this.sprite = scene.add.sprite(x, y, "playBtn", 0);
        this.sprite.setInteractive({ useHandCursor: true });

        this.setupInteractions();
    }

    setupInteractions() {
        this.sprite.on("pointerover", () => {
            this.sprite.setFrame(1);
            this.scene.tweens.add({
                targets: this.sprite,
                scale: 0.98,
                duration: 100,
            });
        });

        this.sprite.on("pointerout", () => {
            this.sprite.setFrame(0);
            this.scene.tweens.add({
                targets: this.sprite,
                scale: 1,
                duration: 100,
            });
        });

        this.sprite.on("pointerdown", () => {
            this.scene.tweens.add({
                targets: this.sprite,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.scene.time.delayedCall(10, () => {
                        this.scene.cameras.main.fadeOut(1000);
                        this.scene.cameras.main.once(
                            "camerafadeoutcomplete",
                            () => {
                                if (this.config.targetScene) {
                                    this.scene.scene.start(
                                        this.config.targetScene
                                    );
                                }
                                this.config.onClick();
                            }
                        );
                    });
                },
            });
        });
    }

    destroy() {
        this.sprite.destroy();
    }

    setEnabled(enabled) {
        this.sprite.setInteractive(enabled);
        this.sprite.setAlpha(enabled ? 1 : 0.5);
    }
}
