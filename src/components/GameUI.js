import globals from "../globals";

export default class GameUI {
    constructor(scene) {
        this.scene = scene;

        this.scoreText = scene.add
            .text(40, 80, "Score: 0", {
                ...globals.bodyTextStyle,
                fontSize: "40px",
                fill: globals.hexString(globals.colors.black500),
            })
            .setDepth(100);

        this.waveText = scene.add
            .text(40, 160, "Wave: 0", {
                ...globals.bodyTextStyle,
                fontSize: "40px",
                fill: globals.hexString(globals.colors.black500),
            })
            .setDepth(100);

        this.comboText = scene.add
            .text(1400, 80, "", {
                ...globals.bodyTextStyle,
                fontSize: "56px",
                fill: globals.hexString(globals.colors.yellow500),
                stroke: globals.hexString(globals.colors.black600),
                strokeThickness: 4,
            })
            .setOrigin(1, 0)
            .setDepth(100);

        this.initStaminaBar();
    }

    initStaminaBar() {
        const barWidth = 600;
        const barHeight = 40;
        const barX = 720;
        const barY = 50;

        this.staminaBarBg = this.scene.add.rectangle(
            barX,
            barY,
            barWidth,
            barHeight,
            globals.hexNum(globals.colors.yellow800)
        );
        this.staminaBarBg.setStrokeStyle(
            4,
            globals.hexNum(globals.colors.white500)
        );

        this.staminaBar = this.scene.add
            .rectangle(
                barX,
                barY,
                barWidth - 8,
                barHeight - 8,
                globals.hexNum(globals.colors.yellow500)
            )
            .setDepth(100);

        this.staminaText = this.scene.add
            .text(barX, barY, "100%", {
                ...globals.bodyTextStyle,
                fontSize: "32px",
                fill: globals.hexString(globals.colors.black500),
            })
            .setOrigin(0.5)
            .setDepth(100);
    }

    updateScore(score) {
        this.scoreText.setText(`Score: ${score}`);
    }

    updateWave(waveNumber) {
        this.waveText.setText(`Wave: ${waveNumber}`);
    }

    updateStamina(stamina, maxStamina) {
        const percentage = stamina / maxStamina;
        const fullWidth = 600 - 8;
        this.staminaBar.width = fullWidth * percentage;

        let color = globals.hexNum(globals.colors.yellow500);
        if (percentage < 0.5 && percentage >= 0.25)
            color = globals.hexNum(globals.colors.yellow500);
        if (percentage < 0.25) color = globals.hexNum(globals.colors.red600);

        this.staminaBar.setFillStyle(color);
        this.staminaText.setText(`${Math.floor(stamina)}%`);
    }

    showCombo(comboCount) {
        if (comboCount > 1) {
            this.comboText.setText(`${comboCount}x COMBO!`);
            this.comboText.setScale(1.5);
            this.scene.tweens.add({
                targets: this.comboText,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
            });
        } else {
            this.comboText.setText("");
        }
    }
}
