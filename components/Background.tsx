import React, { useEffect, useRef, useState } from 'react';
import { ThemeConfig } from '../types';

interface BackgroundProps {
    theme: ThemeConfig;
    phase?: string;
    isTroll?: boolean;
    isParty?: boolean;
    activeColor?: string;
}

export const Background: React.FC<BackgroundProps> = ({ theme, phase, isTroll, isParty, activeColor }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 }); // Percentage 0-100

    // MOUSE TRACKING FOR AURA MODE
    useEffect(() => {
        if (theme.particleType !== 'aura') return;

        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            setMousePos({ x, y });
        };

        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            const x = (touch.clientX / window.innerWidth) * 100;
            const y = (touch.clientY / window.innerHeight) * 100;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [theme.particleType]);

    // CANVAS ANIMATION (STANDARD MODES)
    useEffect(() => {
        if (theme.particleType === 'aura') return; // Skip canvas for Aura mode

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Particle Class
        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            char: string;
            opacity: number;
            originalSpeedY: number;
            trail: {x: number, y: number, opacity: number}[]; // For Cyber theme
            hue: number; // For Party Mode

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.size = Math.random() * (theme.particleType !== 'circle' ? 14 : 3) + 1;
                
                this.originalSpeedY = theme.particleType === 'rain' || theme.particleType === 'binary' 
                    ? Math.random() * 3 + 2 
                    : (Math.random() - 0.5) * 0.5;
                
                this.speedY = this.originalSpeedY;
                this.speedX = theme.particleType === 'rain' || theme.particleType === 'binary' 
                    ? 0 
                    : (Math.random() - 0.5) * 0.5;
                
                this.char = theme.particleType === 'binary' ? (Math.random() > 0.5 ? "1" : "0") : "";
                if (theme.particleType === 'rain') {
                    // Matrix characters
                    const chars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ";
                    this.char = chars[Math.floor(Math.random() * chars.length)];
                }
                this.opacity = Math.random() * 0.5 + 0.1;
                this.trail = [];
                this.hue = Math.random() * 360;
            }

            update() {
                // Game State Reactivity
                let speedMultiplier = 1;
                if (phase === 'revealing') speedMultiplier = 0.5; // Suspense
                if (isTroll) speedMultiplier = 4.0; // Chaos
                if (isParty) speedMultiplier = 2.0; // Party Energy

                // Store trail for Cyber theme
                if (theme.name === "Night City") {
                    this.trail.push({x: this.x, y: this.y, opacity: this.opacity});
                    if (this.trail.length > 5) this.trail.shift();
                }

                this.y += this.speedY * speedMultiplier;
                this.x += this.speedX * speedMultiplier;

                if (isTroll) {
                     // Add chaotic jitter in Troll mode
                     this.x += (Math.random() - 0.5) * 2;
                }
                
                // Party Mode Jitter (Disco lights effect)
                if (isParty) {
                    this.hue = (this.hue + 5) % 360;
                    if (Math.random() > 0.95) {
                        this.x += (Math.random() - 0.5) * 10;
                    }
                }

                if (this.y > canvas!.height) {
                    this.y = -20;
                    this.x = Math.random() * canvas!.width;
                    this.trail = [];
                }
                if (this.x < -20 || this.x > canvas!.width + 20) {
                    this.x = Math.random() * canvas!.width;
                }
            }

            draw() {
                if (!ctx) return;
                
                // Logic for Colors
                let drawColor = theme.accent;

                // Priority: Party Mode > Player Color > Troll > Theme Specifics
                if (isParty) {
                    drawColor = `hsl(${this.hue}, 100%, 60%)`;
                } else if (phase === 'revealing' && activeColor) {
                    drawColor = activeColor;
                } else if (isTroll) {
                     // Flicker color in troll mode
                     drawColor = Math.random() > 0.8 ? '#ef4444' : theme.accent;
                } else if (theme.name === "Turing") {
                     // Turing Theme: Encryption Pulse
                     const pulse = Math.sin(time * 0.05 + this.x * 0.01);
                     if (pulse > 0.8) {
                         drawColor = '#ffffff'; // Bright flash
                     } else if (pulse > 0.5) {
                         drawColor = theme.accent;
                     } else {
                         drawColor = theme.sub; // Dimmed
                     }
                }

                ctx.fillStyle = drawColor;
                ctx.globalAlpha = this.opacity;

                if (theme.particleType === 'circle') {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.font = `${this.size}px ${theme.font}`;
                    ctx.fillText(this.char, this.x, this.y);
                }

                // Cyber Theme: Data Snow Trails
                if (theme.name === "Night City" && this.trail.length > 0 && !isParty) {
                    for (let i = 0; i < this.trail.length; i++) {
                        const point = this.trail[i];
                        const trailOpacity = (i / this.trail.length) * this.opacity * 0.5;
                        ctx.fillStyle = phase === 'revealing' && activeColor ? activeColor : theme.accent;
                        ctx.globalAlpha = trailOpacity;
                        ctx.fillText(this.char, point.x, point.y);
                        
                        // "Digital Collision" effect
                        // Randomly create a horizontal glitch line simulating hitting data
                        if (Math.random() > 0.98) {
                            ctx.fillStyle = "#fff";
                            ctx.fillRect(point.x - 5, point.y, 10, 1);
                        }
                    }
                }
            }
        }

        const initParticles = () => {
            particles = [];
            // Increase density in Troll mode or Party Mode
            const count = (theme.particleType === 'circle' ? 60 : 100) * (isTroll || isParty ? 2 : 1);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        };

        initParticles();

        const render = () => {
            time++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
        };
    }, [theme, phase, isTroll, activeColor, isParty]);

    // RENDER AURA MODE (CSS BLOBS)
    if (theme.particleType === 'aura') {
        const isLuminous = theme.name.includes("Luminous");
        const useActiveColor = phase === 'revealing' && activeColor;
        
        return (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* STOCHASTIC GRAIN LAYER */}
                <div 
                    className="absolute inset-0 z-[1] opacity-[0.05] pointer-events-none mix-blend-overlay"
                    style={{ 
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
                    }}
                />

                {/* BLOB 1 */}
                <div 
                    className="absolute rounded-full blur-[100px] transition-all duration-1000 cubic-bezier(0.1, 0.7, 1.0, 0.1)"
                    style={{
                        width: '50vw',
                        height: '50vw',
                        background: useActiveColor ? activeColor : (isLuminous ? '#FCD34D' : '#00D1FF'), // Amber / Electric Blue
                        opacity: isLuminous ? 0.6 : 0.15,
                        top: '-10%',
                        left: '-10%',
                        transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
                        mixBlendMode: isLuminous ? 'multiply' : 'normal'
                    }}
                />

                {/* BLOB 2 */}
                <div 
                    className="absolute rounded-full blur-[120px] transition-all duration-[2000ms] cubic-bezier(0.1, 0.7, 1.0, 0.1)"
                    style={{
                        width: '40vw',
                        height: '40vw',
                        background: useActiveColor ? activeColor : (isLuminous ? '#F472B6' : '#BD00FF'), // Rose / Neon Violet
                        opacity: isLuminous ? 0.5 : 0.12,
                        bottom: '10%',
                        right: '10%',
                        transform: `translate(-${mousePos.x * 0.3}px, -${mousePos.y * 0.3}px)`,
                        mixBlendMode: isLuminous ? 'multiply' : 'normal'
                    }}
                />

                {/* BLOB 3 */}
                <div 
                    className="absolute rounded-full blur-[150px] animate-[pulse_8s_infinite] transition-all duration-1000"
                    style={{
                        width: '60vw',
                        height: '60vw',
                        background: useActiveColor ? activeColor : (isLuminous ? '#67E8F9' : '#00FF85'), // Cyan / Emerald
                        opacity: isLuminous ? 0.4 : 0.08,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        mixBlendMode: isLuminous ? 'multiply' : 'normal'
                    }}
                />
            </div>
        );
    }

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-opacity duration-1000"
        />
    );
};