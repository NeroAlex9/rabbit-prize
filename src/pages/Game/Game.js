import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
// Класс сцены вращения колеса

let myImage;
let state = 'falling'; // Состояние: falling, movingRight, dead

class BeltScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BeltScene' });
    }


    preload() {
        const assets = [ 'prize'];
        assets.forEach(asset => this.load.image(asset, `/assets/${asset}.png`));
        this.load.spritesheet('conveer', '/assets/conveer.png', { frameWidth: 606, frameHeight: 186 });
    }

    create() {
        this.canSpin = true;
        this.slicePrizes = [
            { name: "Скидка 10%", weight: 20 },
            { name: "Промокод на скидку 30%", weight: 20 },
            { name: "Без выигрыша", weight: 20 },
            { name: "Бесплатное капучино", weight: 20 },
            { name: "Бесплатный РАФ", weight: 20 }
        ];

        this.totalWeight = this.slicePrizes.reduce((acc, prize) => acc + prize.weight, 0);
        this.cumulativeWeights = this.slicePrizes.reduce((acc, prize) => {
            acc.push((acc.length ? acc[acc.length - 1] : 0) + prize.weight);
            return acc;
        }, []);

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        
        this.anims.create({
            key: 'conveer',
            frames: this.anims.generateFrameNumbers('conveer', { start: 0, end: 5 }),
            frameRate: 10, // Скорость анимации (кадров в секунду)
            repeat: -1 // Бесконечное повторение
        });
    
        // Добавляем спрайт на сцену
        const mySprite = this.add.sprite(centerX, 600, 'conveer').setScale(1.14);
    
        // Запускаем анимацию
        mySprite.anims.play('conveer');

        myImage = this.add.image(80, 60, 'prize');

    // Задаем размер изображения (например, 100x100 пикселей)
        myImage.setDisplaySize(150, 150);

    }

    update() {
        if (state === 'falling') {
            // Падение изображения сверху вниз
            myImage.y += 3; // Скорость падения
    
            // Проверка, достигло ли изображение определенного значения по Y
            if (myImage.y >= 500) {
                state = 'movingRight';
            }
        } else if (state === 'movingRight') {
            // Движение изображения вправо
            myImage.x += 3; // Скорость движения вправо
    
            // Проверка, достигло ли изображение определенного значения по X
            if (myImage.x >= 500) {
                state = 'dead';
            }
        } else if (state === 'dead') {
            // Удаление изображения
            myImage.destroy();
    
            // Создание нового изображения и сброс состояния
            myImage = this.add.image(400, 0, 'myImage');
            myImage.setDisplaySize(100, 100);
            state = 'falling';
        }
    }

}

// Компонент Game
const Game = () => {
    const gameRef = useRef(null);
    const phaserGame = useRef(null);

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            backgroundColor: "#1435AD",
            parent: gameRef.current,
            width: 450,
            height: 700,
            // transparent: true,
            // scale: {
            //     mode: Phaser.Scale.FIT,
            //     autoCenter: Phaser.Scale.CENTER_BOTH,
            // },
            
            scene: [BeltScene]
        };

        phaserGame.current = new Phaser.Game(config);

        return () => phaserGame.current?.destroy(true);
    }, []);

    return <div ref={gameRef} />;
};

export default Game;
