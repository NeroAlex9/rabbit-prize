import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class BeltScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BeltScene' });
    }

    preload() {
        // Загрузка спрайтов конвейера и коробки
        this.load.spritesheet('conveer', '/assets/conveer.png', { frameWidth: 606, frameHeight: 186 });
        this.load.image('prize', '/assets/prize.png'); // Спрайт коробки
    }

    create() {
        // Инициализация переменных
        this.canShowPrize = true; // Флаг для управления показом приза
        this.isPaused = false; // Флаг для управления остановкой конвейера

        // Определение призов с весами
        this.slicePrizes = [
            { name: "Скидка 10%", weight: 20 },
            { name: "Промокод на скидку 30%", weight: 20 },
            { name: "Без выигрыша", weight: 20 },
            { name: "Бесплатное капучино", weight: 20 },
            { name: "Бесплатный РАФ", weight: 20 }
        ];

        // Расчёт общего веса и накопительных весов для выбора приза
        this.totalWeight = this.slicePrizes.reduce((acc, prize) => acc + prize.weight, 0);
        this.cumulativeWeights = this.slicePrizes.reduce((acc, prize) => {
            acc.push((acc.length ? acc[acc.length - 1] : 0) + prize.weight);
            return acc;
        }, []);

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Создание анимации конвейера
        this.anims.create({
            key: 'conveer',
            frames: this.anims.generateFrameNumbers('conveer', { start: 0, end: 5 }),
            frameRate: 10, // Скорость анимации (кадров в секунду)
            repeat: -1 // Бесконечное повторение
        });

        // Добавляем спрайт конвейера на сцену и сохраняем ссылку
        this.conveyor = this.add.sprite(centerX, 600, 'conveer').setScale(1.14);
        this.conveyor.anims.play('conveer');

        // Массив для хранения всех созданных коробок
        this.images = [];
        this.imageCreationInterval = 1300; // Интервал создания новых коробок в миллисекундах
        this.lastImageCreationTime = 0;

        // Добавляем текстовый объект для отображения приза в центре экрана
        this.prizeText = this.add.text(centerX, centerY, '', {
            font: '32px Arial',
            fill: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 20, y: 10 },
            align: 'center',
            wordWrap: { width: 300 }
        }).setOrigin(0.5).setVisible(false);
    }

    // Функция для выбора приза на основе весов
    choosePrize() {
        const random = Math.random() * this.totalWeight;
        for (let i = 0; i < this.cumulativeWeights.length; i++) {
            if (random < this.cumulativeWeights[i]) {
                return this.slicePrizes[i];
            }
        }
        return this.slicePrizes[this.slicePrizes.length - 1];
    }

    // Функция для отображения приза
    displayPrize(prize) {
        this.prizeText.setText(`Вы выиграли: ${prize.name}`).setVisible(true);
        // Добавляем анимацию появления
        this.tweens.add({
            targets: this.prizeText,
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Power2'
        });

        // Автоматически скрыть текст через 3 секунды
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: this.prizeText,
                alpha: { from: 1, to: 0 },
                duration: 500,
                ease: 'Power2',
                onComplete: () => this.prizeText.setVisible(false)
            });
            this.canShowPrize = true; // Разрешить показ следующего приза
        }, [], this);
    }

    update(time, delta) {
        if (this.isPaused) {
            return; // Если анимация остановлена, ничего не делаем
        }

        // Создаем новую коробку каждые imageCreationInterval миллисекунд
        if (time - this.lastImageCreationTime >= this.imageCreationInterval) {
            const newBox = this.add.image(-60, 470, 'prize');
            newBox.setDisplaySize(150, 150);
            newBox.setInteractive(); // Делает коробку интерактивной

            // Обработчик клика по коробке
            newBox.on('pointerdown', () => {
                if (this.canShowPrize) {
                    this.canShowPrize = false; // Запрещаем показ приза до завершения текущего
                    this.stopConveyor(); // Останавливаем анимацию конвейера
                    const selectedPrize = this.choosePrize();
                    this.displayPrize(selectedPrize);
                }
            });

            this.images.push(newBox);
            this.lastImageCreationTime = time;
        }

        // Двигаем все коробки вправо
        this.images.forEach(image => {
            if (image && image.x !== undefined) {
                image.x += 3; // Скорость движения вправо
                if (image.x >= 550) {
                    image.destroy(); // Удаляем коробку, если она вышла за пределы экрана
                }
            }
        });

        // Удаляем коробки, которые вышли за пределы экрана
        this.images = this.images.filter(image => image && image.x !== undefined && image.x < 550);
    }

    // Функция для остановки конвейера и анимации коробок
    stopConveyor() {
        // Останавливаем анимацию конвейера
        if (this.conveyor && this.conveyor.anims.isPlaying) {
            this.conveyor.anims.stop();
        }

        // Устанавливаем флаг остановки
        this.isPaused = true;

        // Останавливаем движение всех коробок
        this.images.forEach(image => {
            if (image && image.body) {
                image.body.velocity.x = 0;
            }
        });
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
            scene: [BeltScene],
            // physics: {
            //     default: 'arcade',
            //     arcade: {
            //         gravity: { y: 0 },
            //         debug: false
            //     }
            // }
        };

        phaserGame.current = new Phaser.Game(config);

        return () => phaserGame.current?.destroy(true);
    }, []);

    return <div ref={gameRef} />;
};

export default Game;
