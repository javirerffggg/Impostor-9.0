// @ts-ignore
import confetti from 'canvas-confetti';

export const revealImpostorEffect = () => {
    // Partículas rojas estilo "sangre digital"
    const count = 50;
    const defaults = {
        origin: { y: 0.5 },
        colors: ['#ef4444', '#dc2626', '#991b1b', '#7f1d1d'],
        shapes: ['circle', 'square'],
        scalar: 0.8,
        gravity: 2,
        drift: 0,
        ticks: 200
    };
    
    // Explosión izquierda
    confetti({
        ...defaults,
        particleCount: count / 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.5 }
    });
    
    // Explosión derecha
    confetti({
        ...defaults,
        particleCount: count / 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.5 }
    });
    
    // Efecto de screen shake
    if (document.body) {
        document.body.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            if (document.body) document.body.style.animation = '';
        }, 500);
    }
};