import { Boot } from "./scenes/Boot";
import { Tutorial } from "./scenes/Tutorial";
import { GameScene } from "./scenes/GameScene";
import { Game } from "phaser";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import global from "./globals";

const config = {
    type: Phaser.AUTO,
    height: 1920,
    width: 1440,
    parent: "game-container",
    backgroundColor: global.colors.black600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 400 },
        },
    },
    scene: [Boot, Preloader, MainMenu, Tutorial, GameScene, GameOver],
};

global.centerX = config.width / 2;
global.centerY = config.height / 2;

export default new Game(config);

