import { Scene } from "phaser";
import globals from "../globals";
import GameUI from "../components/GameUI";
import Bug from "../components/Bug";

export class GameScene extends Scene {
    constructor() {
        super("GameScene");
    }

    init() {
        this.bugs = [];
        this.stuckBugs = [];

        this.score = 0;
        this.gameOver = false;

        this.maxStamina = 100;
        this.stamina = this.maxStamina;
        this.staminaRegenRate = 5;
        this.smashStaminaCost = 10;
        this.bugDrainRate = 2;

        this.currentWave = 0;
        this.bugsInWave = 5;
        this.bugsSpawned = 0;
        this.bugsActive = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 800;
        this.inWave = false;
        this.damageTakenThisWave = false;
        this.bugsSmashed = 0;

        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboWindow = 2000;
        this.comboMultiplier = 1;

        this.playerX = 720;
        this.playerY = 1892;
        this.stickingX = 60;
        this.stickingY = -180;
        this.playerRadius = 80;
        this.bugStickRange = 120;
        this.bugAttractRange = 300;

        this.bugSpray = null;
        this.bugSprayTimer = 0;
        this.bugSpraySpawnInterval = 15000;

        this.pathRegion = {
            x: 120,
            y: 0,
            width: 1200,
            height: 1920,
        };

        this.bugTypes = {
            normal: {
                type: "normal",
                spriteKey: "adultWalk",
                health: 1,
                speed: [60, 140],
                points: 10,
                size: 50,
            },
            fast: {
                type: "fast",
                spriteKey: "darthMaulWalk",
                color: 0xff6600,
                health: 1,
                speed: [120, 200],
                points: 15,
                size: 40,
            },
            tank: {
                type: "tank",
                spriteKey: "adultWalk",
                color: 0x0066cc,
                shape: "diamond",
                health: 3,
                speed: [30, 60],
                points: 30,
                size: 70,
            },
            splitter: {
                type: "splitter",
                spriteKey: "adultWalk",
                color: 0x9900cc,
                shape: "circle",
                health: 1,
                speed: [50, 100],
                points: 20,
                size: 65,
            },
            boss: {
                type: "boss",
                spriteKey: "adultWalk",
                color: 0xff0000,
                shape: "square",
                health: 10,
                speed: [20, 40],
                points: 100,
                size: 100,
            },
        };
    }

    create() {
        this.cameras.main.fadeIn(1000);
        this.audioManager = this.game.registry.get("audioManager");
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playBackgroundMusic("bgMusic", {
            volume: 0.2,
            loop: true,
        });

        this.drawPath();
        this.add.rectangle(720, 960, 1440, 1920, 0xf8f6f2);

        this.pathWalkAnimation = this.add
            .sprite(globals.centerX, globals.centerY, "walkFrame1")
            .setOrigin(0.5);

        this.pathWalkAnimation.on("animationstart", () => {
            this.cameras.main.shake(1020, 0.001);
        });

        this.player = this.add.circle(
            this.playerX + this.stickingX,
            this.playerY + this.stickingY,
            this.playerRadius,
            0x4444ff,
            0
        );
        this.player.setDepth(10);
        this.playerSprite = this.add
            .sprite(
                this.playerX,
                this.playerY - this.playerY / 4,
                "playerWalk",
                0
            )
            .setDepth(50)
            .setScale(2)
            .setOrigin(0.5);

        this.attractRangeCircle = this.add.circle(
            this.playerX,
            this.playerY - 30,
            this.bugAttractRange,
            globals.hexNum(globals.colors.black500),
            0.2
        );
        this.attractRangeCircle.setDepth(1);

        this.ui = new GameUI(this);
        this.ui.updateScore(this.score);
        this.ui.updateWave(this.currentWave);
        this.ui.updateStamina(this.stamina, this.maxStamina);

        this.input.on("pointerdown", (pointer) => {
            this.onSmash(pointer.x, pointer.y);
        });

        this.cameras.main.setBounds(0, 0, 1440, 1920);

        this.startWave();
    }

    drawPath() {
        const graphics = this.add.graphics();
        graphics.fillStyle(globals.hexNum(globals.colors.white500), 1);
        graphics.fillRect(
            this.pathRegion.x,
            this.pathRegion.y,
            this.pathRegion.width,
            this.pathRegion.height
        );

        graphics.lineStyle(4, globals.hexNum(globals.colors.white600), 0.5);
        for (let i = 1; i < 3; i++) {
            const y = this.pathRegion.y + (this.pathRegion.height / 3) * i;
            graphics.lineBetween(
                this.pathRegion.x + 40,
                y,
                this.pathRegion.x + this.pathRegion.width - 40,
                y
            );
        }
    }

    startWave() {
        this.currentWave++;
        this.bugsSpawned = 0;
        this.inWave = true;
        this.damageTakenThisWave = false;

        this.stamina = this.maxStamina;
        this.ui.updateStamina(this.stamina, this.maxStamina);

        this.bugsInWave = 5 + (this.currentWave - 1) * 3;
        this.spawnInterval = Math.max(400, 800 - (this.currentWave - 1) * 50);

        this.ui.updateWave(this.currentWave);

        const isBossWave = this.currentWave % 5 === 0;
        const waveText = this.add
            .text(
                720,
                960,
                isBossWave
                    ? `BOSS WAVE ${this.currentWave}!`
                    : `WAVE ${this.currentWave}`,
                {
                    ...globals.bodyTextStyle,
                    fontSize: isBossWave ? "110px" : "128px",
                    fill: isBossWave
                        ? globals.hexString(globals.colors.red500)
                        : globals.hexString(globals.colors.yellow500),
                    stroke: globals.hexString(globals.colors.black500),
                    strokeThickness: 8,
                }
            )
            .setOrigin(0.5)
            .setDepth(100);

        this.tweens.add({
            targets: waveText,
            alpha: 0.3,
            scale: 1.2,
            duration: 300,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                waveText.destroy();
            },
        });
    }

    spawnBug() {
        if (!this.inWave || this.bugsSpawned >= this.bugsInWave) return;

        let bugTypeKey = "normal";
        if (this.currentWave % 5 === 0 && this.bugsSpawned === 0)
            bugTypeKey = "boss";
        else if (this.currentWave >= 3) {
            const rand = Math.random();
            if (rand < 0.3) bugTypeKey = "fast";
            else if (rand < 0.5) bugTypeKey = "tank";
            else if (rand < 0.65 && this.currentWave >= 5)
                bugTypeKey = "splitter";
        }

        const bugType = this.bugTypes[bugTypeKey];
        const pr = this.pathRegion;

        const edge = Phaser.Math.Between(0, 2);
        let x, y, targetX, targetY;

        switch (edge) {
            case 0:
                x = Phaser.Math.Between(pr.x, pr.x + pr.width);
                y = pr.y;
                targetX = Phaser.Math.Between(
                    pr.x + 100,
                    pr.x + pr.width - 100
                );
                targetY = pr.y + pr.height - 100;
                break;
            case 1:
                x = pr.x + pr.width;
                y = Phaser.Math.Between(pr.y, pr.y + pr.height / 2);
                targetX = pr.x + 100;
                targetY = Phaser.Math.Between(
                    pr.y + 100,
                    pr.y + pr.height - 100
                );
                break;
            case 2:
                x = pr.x;
                y = Phaser.Math.Between(pr.y, pr.y + pr.height / 2);
                targetX = pr.x + pr.width - 100;
                targetY = Phaser.Math.Between(
                    pr.y + 100,
                    pr.y + pr.height - 100
                );
                break;
        }

        const speed = Phaser.Math.Between(bugType.speed[0], bugType.speed[1]);
        const bug = new Bug(this, x, y, {
            ...bugType,
            speed: speed,
        });

        this.bugs.push(bug);
        this.bugsSpawned++;
        this.bugsActive++;

        this.moveBugToTarget(bug, targetX, targetY);
    }

    moveBugToTarget(bug, targetX, targetY) {
        if (!bug.isAlive || bug.isStuck) return;

        const distance = Phaser.Math.Distance.Between(
            bug.x,
            bug.y,
            targetX,
            targetY
        );
        const duration = (distance / bug.speed) * 1000;

        if (bug.currentTween) {
            bug.currentTween.stop();
        }
        const angle = Phaser.Math.Angle.Between(bug.x, bug.y, targetX, targetY);
        bug.setRotation(angle + Math.PI / 2);

        bug.currentTween = this.tweens.add({
            targets: bug,
            x: targetX,
            y: targetY,
            duration: duration,
            ease: "Cubic.ease",
            onComplete: () => {
                if (bug.isAlive && !bug.isStuck && !bug.movingToPlayer) {
                    const newX = Phaser.Math.Between(
                        this.pathRegion.x + 100,
                        this.pathRegion.x + this.pathRegion.width - 100
                    );
                    const newY = Phaser.Math.Between(
                        this.pathRegion.y + 100,
                        this.pathRegion.y + this.pathRegion.height - 100
                    );
                    this.moveBugToTarget(bug, newX, newY);
                }
            },
        });
    }

    stickBugToPlayer(bug) {
        if (bug.isStuck) return;

        bug.isStuck = true;
        bug.movingToPlayer = false;
        bug.isAlive = false;
        bug.setStuck(true);
        this.bugsActive--;
        this.damageTakenThisWave = true;

        if (bug.currentTween) {
            bug.currentTween.stop();
        }
        this.tweens.killTweensOf(bug);

        // Constrain angle to upper half of circle (from PI to 2*PI, or -PI to 0)
        // This creates a semicircle above the player
        const baseAngle = Math.PI; // Start from left side
        const angleRange = Math.PI; // Cover 180 degrees (upper half)
        const angle =
            baseAngle +
            this.stuckBugs.length * (angleRange / 8) +
            Math.random() * 0.3;

        const radius = this.playerRadius + 20;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        // Use the player circle's position (which includes stickingX and stickingY offsets)
        const stickCenterX = this.playerX + this.stickingX;
        const stickCenterY = this.playerY + this.stickingY;

        bug.setPosition(stickCenterX + offsetX, stickCenterY + offsetY);
        bug.setDepth(60);
        const bugToPlayerAngle = Phaser.Math.Angle.Between(
            bug.x,
            bug.y,
            stickCenterX,
            stickCenterY
        );
        bug.setRotation(bugToPlayerAngle + Math.PI / 2);

        this.stuckBugs.push(bug);

        this.showDamageNumber(bug.x, bug.y, `-${this.bugDrainRate}/s`);

        this.tweens.add({
            targets: bug,
            scaleX: 0.7,
            scaleY: 0.7,
            alpha: 0.9,
            duration: 200,
        });

        bug.setInteractive(
            new Phaser.Geom.Circle(0, 0, 40),
            Phaser.Geom.Circle.Contains
        );
        bug.shakeOffTaps = 0;
        bug.shakeOffRequired = 3;

        bug.off("pointerdown");
        bug.on("pointerdown", () => {
            this.shakeOffBug(bug);
        });

        if (this.bugsActive === 0 && this.bugsSpawned >= this.bugsInWave) {
            this.completeWave();
        }
    }

    shakeOffBug(bug) {
        bug.shakeOffTaps++;

        this.tweens.add({
            targets: bug,
            angle: bug.angle + 15,
            duration: 50,
            yoyo: true,
        });

        if (bug.shakeOffTaps >= bug.shakeOffRequired) {
            const shakeText = this.add
                .text(bug.x, bug.y, "SHAKEN OFF!", {
                    ...globals.bodyTextStyle,
                    fontSize: "32px",
                    fill: globals.hexString(globals.colors.black500),
                })
                .setOrigin(0.5)
                .setDepth(100);

            this.tweens.add({
                targets: shakeText,
                y: bug.y - 100,
                alpha: 0,
                duration: 1000,
                onComplete: () => shakeText.destroy(),
            });

            this.stuckBugs = this.stuckBugs.filter((b) => b !== bug);
            bug.destroy();
        }
    }

    showDamageNumber(x, y, text) {
        const dmgText = this.add
            .text(x, y, text, {
                ...globals.bodyTextStyle,
                fontSize: "36px",
                fill: globals.hexString(globals.colors.red500),
                stroke: globals.hexString(globals.colors.black500),
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(100);

        this.tweens.add({
            targets: dmgText,
            y: y - 80,
            alpha: 0,
            duration: 1500,
            onComplete: () => dmgText.destroy(),
        });
    }

    onSmash(x, y) {
        if (this.gameOver) return;
        if (this.stamina < this.smashStaminaCost) return;

        let bugHit = false;

        const smashEffect = this.add.circle(x, y, 60, 0xff0000, 0.5);
        this.tweens.add({
            targets: smashEffect,
            alpha: 0,
            scale: 1.5,
            duration: 200,
            onComplete: () => smashEffect.destroy(),
        });

        this.playerSprite.setPosition(x, y);

        this.playerSprite.setOrigin(0.4, 0.3);
        this.playerSprite.setTexture("playerStomp", 0);
        this.playerSprite.play("playerStomp");

        this.playerSprite.once("animationcomplete", () => {
            this.playerSprite.setTexture("playerWalk", 0);
            this.playerSprite.setPosition(
                this.playerX,
                this.playerY - this.playerY / 4
            );
            this.playerSprite.setOrigin(0.5);
        });

        for (let bug of this.bugs) {
            if (!bug.isAlive || bug.isStuck) continue;
            const dist = Phaser.Math.Distance.Between(x, y, bug.x, bug.y);
            if (dist < 70) {
                this.smashBug(bug);
                const pointsText = this.add
                    .text(bug.x, bug.y, `+${bug.points}`, {
                        ...globals.bodyTextStyle,
                        fontSize: "40px",
                        fill: globals.hexString(globals.colors.yellow500),
                        stroke: globals.hexString(globals.colors.black500),
                        strokeThickness: 3,
                    })
                    .setOrigin(0.5)
                    .setDepth(100);
                this.tweens.add({
                    targets: pointsText,
                    y: bug.y - 100,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => pointsText.destroy(),
                });
                bugHit = true;
            }
        }

        if (bugHit) {
            this.stamina -= this.smashStaminaCost;
            this.cameras.main.shake(200, 0.005);
        } else {
            this.stamina -= this.smashStaminaCost * 2;

            const missText = this.add
                .text(x, y, `-${this.smashStaminaCost * 2}`, {
                    ...globals.bodyTextStyle,
                    fontSize: "32px",
                    fill: globals.hexString(globals.colors.red600),
                    stroke: globals.hexString(globals.colors.black500),
                    strokeThickness: 3,
                })
                .setOrigin(0.5)
                .setDepth(100);

            this.tweens.add({
                targets: missText,
                y: y - 60,
                alpha: 0,
                duration: 800,
                onComplete: () => missText.destroy(),
            });

            for (let bug of this.bugs) {
                if (!bug.isAlive || bug.isStuck) continue;
                const dist = Phaser.Math.Distance.Between(x, y, bug.x, bug.y);
                if (dist < 150) {
                    const angle = Phaser.Math.Angle.Between(x, y, bug.x, bug.y);
                    const jumpDistance = 150;
                    const jumpX = bug.x + Math.cos(angle) * jumpDistance;
                    const jumpY = bug.y + Math.sin(angle) * jumpDistance;
                    const pr = this.pathRegion;
                    const constrainedX = Phaser.Math.Clamp(
                        jumpX,
                        pr.x + 80,
                        pr.x + pr.width - 80
                    );
                    const constrainedY = Phaser.Math.Clamp(
                        jumpY,
                        pr.y + 80,
                        pr.y + pr.height - 80
                    );

                    bug.jumpTo(constrainedX, constrainedY, () => {
                        if (bug.isAlive && !bug.isStuck) {
                            const newTargetX = Phaser.Math.Between(
                                pr.x + 100,
                                pr.x + pr.width - 100
                            );
                            const newTargetY = Phaser.Math.Between(
                                pr.y + 100,
                                pr.y + pr.height - 100
                            );
                            bug.moveToTarget(newTargetX, newTargetY);
                        }
                    });
                }
            }
        }

        this.stamina = Math.max(0, this.stamina);
        this.ui.updateStamina(this.stamina, this.maxStamina);
    }

    smashBug(bug) {
        if (!bug.isAlive || bug.isStuck) return;

        this.audioManager.playSound("smash", {
            loop: false,
            volume: 1,
        });
        this.audioManager.playSound("footsteps", {
            loop: false,
            volume: 1,
        });
        bug.takeDamage();

        if (!bug.isAlive) {
            if (bug.type === "splitter") {
                this.spawnSplitterOffspring(bug.x, bug.y);
            }

            this.bugsSmashed++;
            this.bugsActive--;
            this.score += bug.points * this.comboMultiplier;
            this.ui.updateScore(this.score);

            this.comboCount++;
            this.comboTimer = this.comboWindow;
            this.comboMultiplier = Math.min(
                5,
                1 + Math.floor(this.comboCount / 3)
            );
            this.ui.showCombo(this.comboCount);

            if (this.bugsActive === 0 && this.bugsSpawned >= this.bugsInWave) {
                this.playerSprite.once("animationcomplete", () => {
                    this.completeWave();
                });
            }
        }
    }

    spawnSplitterOffspring(x, y) {
        const offspringConfig = {
            type: "fast",
            spriteKey: "babyWalk",
            color: 0xcc66ff,
            health: 1,
            speed: 100,
            points: 5,
            size: 35,
        };

        const pr = this.pathRegion;

        for (let i = 0; i < 2; i++) {
            const angle = (Math.PI * 2 * i) / 2 + Math.random() * 0.5;
            const spawnDistance = 140;
            const spawnX = x + Math.cos(angle) * spawnDistance;
            const spawnY = y + Math.sin(angle) * spawnDistance;

            const constrainedX = Phaser.Math.Clamp(
                spawnX,
                pr.x + 50,
                pr.x + pr.width - 50
            );
            const constrainedY = Phaser.Math.Clamp(
                spawnY,
                pr.y + 50,
                pr.y + pr.height - 50
            );

            const offspring = new Bug(
                this,
                constrainedX,
                constrainedY,
                offspringConfig
            );
            this.bugs.push(offspring);
            this.bugsActive++;

            offspring.setScale(0);
            this.tweens.add({
                targets: offspring,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: "Back.easeOut",
            });

            const targetX = Phaser.Math.Between(
                pr.x + 100,
                pr.x + pr.width - 100
            );
            const targetY = Phaser.Math.Between(
                pr.y + 100,
                pr.y + pr.height - 100
            );

            this.time.delayedCall(200, () => {
                if (offspring.isAlive && !offspring.isStuck) {
                    this.moveBugToTarget(offspring, targetX, targetY);
                }
            });
        }
    }

    completeWave() {
        this.inWave = false;

        this.audioManager.playSound("footsteps", {
            loop: true,
            volume: 0.9,
        });

        this.pathWalkAnimation.play("pathWalk");
        this.playerSprite.play("playerWalk");

        this.pathWalkAnimation.once("animationcomplete", () => {
            this.audioManager.stopSound("footsteps");
            this.playerSprite.stop("playerWalk").setFrame(0);
        });

        if (!this.damageTakenThisWave) {
            const bonus = 100 * this.currentWave;
            this.score += bonus;
            this.ui.updateScore(this.score);

            const bonusText = this.add
                .text(720, 960, `PERFECT WAVE!\n+${bonus} BONUS`, {
                    ...globals.bodyTextStyle,
                    fontSize: "64px",
                    fill: globals.hexString(globals.colors.yellow500),
                    stroke: globals.hexString(globals.colors.black500),
                    strokeThickness: 6,
                    align: "center",
                })
                .setOrigin(0.5)
                .setDepth(100);

            this.tweens.add({
                targets: bonusText,
                scale: 1.3,
                alpha: 0,
                duration: 2000,
                onComplete: () => {
                    bonusText.destroy();
                },
            });
        }

        this.time.delayedCall(2000, () => {
            if (!this.gameOver) {
                this.startWave();
            }
        });
    }

    endGame() {
        this.gameOver = true;

        this.bugs.forEach((bug) => {
            if (bug.currentTween) bug.currentTween.stop();
        });

        this.time.removeAllEvents();

        this.time.delayedCall(500, () => {
            this.scene.start("GameOver", {
                score: this.score,
                wave: this.currentWave,
                bugsSmashed: this.bugsSmashed,
            });
        });
    }

    shutdown() {
        this.input.off("pointerdown");

        this.bugs.forEach((bug) => bug.destroy());
        this.stuckBugs.forEach((bug) => bug.destroy());

        this.time.removeAllEvents();
    }

    update(time, delta) {
        if (this.gameOver) return;

        const deltaSeconds = delta / 1000;

        if (this.comboCount > 0) {
            this.comboTimer -= delta;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
                this.comboMultiplier = 1;
                this.ui.showCombo(0);
            }
        }

        if (this.stamina < this.maxStamina && this.stuckBugs.length === 0) {
            this.stamina = Math.min(
                this.maxStamina,
                this.stamina + this.staminaRegenRate * deltaSeconds
            );
            this.ui.updateStamina(this.stamina, this.maxStamina);
        }

        if (this.stuckBugs.length > 0) {
            this.stamina -=
                this.bugDrainRate * this.stuckBugs.length * deltaSeconds;
            this.ui.updateStamina(this.stamina, this.maxStamina);

            if (this.stamina <= 0) {
                this.stamina = 0;
                this.endGame();
                return;
            }
        }

        if (this.inWave) {
            this.spawnTimer += delta;
            if (
                this.spawnTimer >= this.spawnInterval &&
                this.bugsSpawned < this.bugsInWave
            ) {
                this.spawnTimer = 0;
                this.spawnBug();
            }
        }

        for (let bug of this.bugs) {
            if (!bug.isAlive || bug.isStuck) continue;

            const distToPlayer = Phaser.Math.Distance.Between(
                bug.x,
                bug.y,
                this.playerX,
                this.playerY
            );

            if (distToPlayer < this.bugStickRange) {
                this.stickBugToPlayer(bug);
            } else if (
                distToPlayer < this.bugAttractRange &&
                !bug.movingToPlayer
            ) {
                bug.moveTowardPlayer(
                    this.playerX,
                    this.playerY,
                    this.bugStickRange
                );
            }
        }
    }
}
