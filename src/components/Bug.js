export default class Bug extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);
        this.scene = scene;

        this.type = config.type;
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.points = config.points;
        this.color = config.color;
        this.shape = config.shape;
        this.size = config.size;
        this.spriteKey = config.spriteKey || "adultWalk";
        this.isAlive = true;
        this.isStuck = false;
        this.movingToPlayer = false;

        this.currentTween = null;

        if (
            scene.textures.exists(this.spriteKey) &&
            scene.anims.exists(this.spriteKey)
        ) {
            this.sprite = scene.add.sprite(0, 0, this.spriteKey);
            this.sprite.setScale(this.size / 100);
            this.sprite.play(this.spriteKey);

            this.add(this.sprite);
        } else {
            const body = scene.add.circle(0, 0, this.size, this.color);
            this.add(body);

            const head = scene.add.circle(
                0,
                -this.size * 0.66,
                this.size * 0.53,
                this.color - 0x111111
            );
            this.add(head);

            const graphics = scene.add.graphics();
            graphics.lineStyle(4, 0x000000, 1);
            graphics.lineBetween(
                -this.size * 0.2,
                -this.size,
                -this.size * 0.53,
                -this.size * 1.46
            );
            graphics.lineBetween(
                this.size * 0.2,
                -this.size,
                this.size * 0.53,
                -this.size * 1.46
            );
            this.add(graphics);
        }

        if (["tank", "boss"].includes(this.type)) {
            const healthBarBg = scene.add.rectangle(
                0,
                this.size + 15,
                this.size,
                8,
                0x000000
            );
            const healthBar = scene.add.rectangle(
                0,
                this.size + 15,
                this.size,
                6,
                0x00ff00
            );
            this.add(healthBarBg);
            this.add(healthBar);
            this.healthBar = healthBar;
            this.maxHealthBarWidth = this.size;
        }

        if (this.shape) {
            const shapeSize = 20;
            const shapeY = 0;
            const shapeColor = this.color || 0xffffff;

            if (this.shape === "circle") {
                const circle = scene.add.circle(
                    0,
                    shapeY,
                    shapeSize * 0.6,
                    shapeColor
                );
                circle.setStrokeStyle(2, 0x000000);
                this.add(circle);
            } else if (this.shape === "square") {
                const square = scene.add.rectangle(
                    0,
                    shapeY,
                    shapeSize,
                    shapeSize,
                    shapeColor
                );
                square.setStrokeStyle(2, 0x000000);
                this.add(square);
            } else if (this.shape === "diamond") {
                const diamond = scene.add.rectangle(
                    0,
                    shapeY,
                    shapeSize,
                    shapeSize,
                    shapeColor
                );
                diamond.setRotation(Math.PI / 4);
                diamond.setStrokeStyle(2, 0x000000);
                this.add(diamond);
            }
        }

        scene.add.existing(this);
    }

    setStuck(isStuck) {
        this.isStuck = isStuck;
        if (this.sprite && this.sprite.anims) {
            if (isStuck) {
                this.sprite.anims.stop();
                const firstFrame = this.scene.anims.get(this.spriteKey)
                    .frames[0].frame.name;
                this.sprite.setFrame(firstFrame);
            } else {
                this.sprite.anims.play(this.spriteKey, true);
            }
        }
    }

    takeDamage() {
        this.health--;

        if (this.healthBar) {
            const ratio = this.health / this.maxHealth;
            this.healthBar.width = this.maxHealthBarWidth * ratio;
            this.healthBar.setFillStyle(
                ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffff00 : 0xff0000
            );
        }

        if (this.health <= 0) {
            this.die();
        } else {
            this.scene.tweens.add({
                targets: this,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                yoyo: true,
            });
        }
    }

    die() {
        this.isAlive = false;
        if (this.currentTween) this.currentTween.stop();

        if (
            this.type !== "fast" &&
            this.sprite &&
            this.scene.textures.exists("adultSmashed")
        ) {
            this.sprite.stop();
            this.sprite.setTexture("adultSmashed");
        }
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 800,
            onComplete: () => this.destroy(),
        });
    }

    jumpTo(x, y, afterJumpCallback) {
        this.movingToPlayer = false;
        if (this.currentTween) this.currentTween.stop();

        const shouldFlutter =
            this.type !== "fast" &&
            this.sprite &&
            this.scene.textures.exists("adultFlutter") &&
            this.scene.anims.exists("adultFlutter");

        if (shouldFlutter) {
            this.sprite.play("adultFlutter");
        }

        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 250,
            yoyo: true,
            onComplete: () => {
                this.currentTween = this.scene.tweens.add({
                    targets: this,
                    x,
                    y,
                    duration: 400,
                    ease: "Back.easeOut",
                    onComplete: () => {
                        this.scaleX = 1;
                        this.scaleY = 1;

                        if (
                            shouldFlutter &&
                            this.sprite &&
                            this.scene.anims.exists(this.spriteKey)
                        ) {
                            this.sprite.play(this.spriteKey);
                        }

                        if (afterJumpCallback) afterJumpCallback();
                    },
                });
            },
        });
    }

    moveToTarget(targetX, targetY) {
        if (!this.isAlive || this.isStuck) return;
        const distance = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            targetX,
            targetY
        );
        const duration = (distance / this.speed) * 1000;
        if (this.currentTween) this.currentTween.stop();

        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            targetX,
            targetY
        );
        this.setRotation(angle + Math.PI / 2);

        this.currentTween = this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration,
            ease: "Cubic.easeOut",
            onComplete: () => {
                if (this.isAlive && !this.isStuck && !this.movingToPlayer) {
                    const pr = this.scene.pathRegion;
                    let newTargetX = Phaser.Math.Between(
                        pr.x + 100,
                        pr.x + pr.width - 100
                    );
                    let newTargetY = Phaser.Math.Between(
                        pr.y + 100,
                        pr.y + pr.height - 100
                    );
                    this.moveToTarget(newTargetX, newTargetY);
                }
            },
        });
    }

    moveTowardPlayer(playerX, playerY, bugStickRange) {
        if (!this.isAlive || this.isStuck) return;
        this.movingToPlayer = true;

        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            playerX,
            playerY
        );
        this.setRotation(angle + Math.PI / 2);
        const targetX = playerX - Math.cos(angle) * (bugStickRange * 0.5);
        const targetY = playerY - Math.sin(angle) * (bugStickRange * 0.5);

        const distance = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            targetX,
            targetY
        );
        const duration = (distance / (this.speed * 1.5)) * 1000;

        if (this.currentTween) this.currentTween.stop();

        this.currentTween = this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration,
            ease: "Cubic.easeInOut",
            onComplete: () => {
                if (this.isAlive && !this.isStuck && this.movingToPlayer) {
                    this.moveTowardPlayer(playerX, playerY, bugStickRange);
                }
            },
        });
    }
}
