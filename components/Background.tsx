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

    // MOUSE TRACKING FOR AURA MODE & PARTICLES
    useEffect(() => {
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
    }, []);

    // CANVAS ANIMATION (STANDARD & PREMIUM MODES)
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
            
            // Premium Properties
            rotation: number;
            rotationSpeed: number;
            oscillationOffset: number;
            customColor: string;
            
            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                
                // Base Speed
                const baseSpeed = theme.particleSpeed || 0.5;

                // Type Specific Init
                switch (theme.particleType) {
                    case 'silk':
                        this.size = Math.random() * 2 + 0.5;
                        this.speedY = -(Math.random() * baseSpeed + 0.1); // Upward
                        this.speedX = 0;
                        break;
                    case 'stardust':
                        this.size = Math.random() * 3 + 1;
                        this.speedY = (Math.random() - 0.5) * baseSpeed;
                        this.speedX = (Math.random() - 0.5) * baseSpeed;
                        break;
                    case 'foliage':
                        this.size = Math.random() * 4 + 2;
                        this.speedY = Math.random() * baseSpeed + 0.2; // Downward
                        this.speedX = 0;
                        break;
                    case 'aurora':
                        this.size = Math.random() * 20 + 10;
                        this.speedY = -(Math.random() * baseSpeed + 0.2); // Upward flow
                        this.speedX = 0;
                        break;
                    case 'goldleaf':
                        this.size = Math.random() * 8 + 4;
                        this.speedY = Math.random() * baseSpeed + 0.5; // Downward
                        this.speedX = (Math.random() - 0.5) * 1;
                        break;
                    case 'plankton':
                        this.size = Math.random() * 3 + 1;
                        this.speedY = (Math.random() - 0.5) * baseSpeed;
                        this.speedX = (Math.random() - 0.5) * baseSpeed;
                        break;
                    case 'ember':
                        this.size = Math.random() * 4 + 1;
                        this.speedY = -(Math.random() * baseSpeed + 0.5); // Upward
                        this.speedX = (Math.random() - 0.5) * 0.5;
                        break;
                    default:
                        // Classic behavior
                        this.size = Math.random() * (theme.particleType !== 'circle' ? 14 : 3) + 1;
                        this.speedY = theme.particleType === 'rain' || theme.particleType === 'binary' 
                            ? Math.random() * 3 + 2 
                            : (Math.random() - 0.5) * 0.5;
                        this.speedX = theme.particleType === 'rain' || theme.particleType === 'binary' 
                            ? 0 
                            : (Math.random() - 0.5) * 0.5;
                }

                this.originalSpeedY = this.speedY;
                
                // Character for Binary/Rain
                this.char = theme.particleType === 'binary' ? (Math.random() > 0.5 ? "1" : "0") : "";
                if (theme.particleType === 'rain') {
                    const chars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ";
                    this.char = chars[Math.floor(Math.random() * chars.length)];
                }
                
                this.opacity = Math.random() * 0.5 + 0.1;
                this.trail = [];
                this.hue = Math.random() * 360;
                
                this.rotation = Math.random() * 360;
                this.rotationSpeed = (Math.random() - 0.5) * 2;
                this.oscillationOffset = Math.random() * 100;
                
                // Color Logic
                this.customColor = '';
                if (theme.particleColor) {
                    if (Array.isArray(theme.particleColor)) {
                        this.customColor = theme.particleColor[Math.floor(Math.random() * theme.particleColor.length)];
                    } else {
                        this.customColor = theme.particleColor;
                    }
                }
            }

            update() {
                // Game State Reactivity
                let speedMultiplier = 1;
                if (phase === 'revealing') speedMultiplier = 0.5; 
                if (isTroll) speedMultiplier = 4.0;
                if (isParty) speedMultiplier = 2.0;

                // --- PREMIUM BEHAVIORS ---
                
                if (theme.particleType === 'silk') {
                    // Sinusoidal movement
                    this.x += Math.sin(time * 0.01 + this.oscillationOffset) * 0.5;
                } else if (theme.particleType === 'goldleaf') {
                    // Leaf falling physics
                    this.rotation += this.rotationSpeed;
                    this.x += Math.sin(time * 0.02 + this.oscillationOffset) * 1;
                } else if (theme.particleType === 'ember') {
                    // Zigzag upward
                    this.x += Math.cos(time * 0.05 + this.oscillationOffset) * 0.5;
                    this.opacity -= 0.002;
                    if (this.opacity <= 0) this.reset();
                } else if (theme.particleType === 'plankton' || theme.particleType === 'stardust') {
                    // Interaction: Repel from mouse/touch
                    const dx = this.x - (mousePos.x * canvas!.width / 100);
                    const dy = this.y - (mousePos.y * canvas!.height / 100);
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 150) {
                        const force = (150 - dist) / 150;
                        this.x += (dx / dist) * force * 5;
                        this.y += (dy / dist) * force * 5;
                    }
                }

                this.y += this.speedY * speedMultiplier;
                this.x += this.speedX * speedMultiplier;

                // Cyber Theme Trail
                if (theme.name === "Night City") {
                    this.trail.push({x: this.x, y: this.y, opacity: this.opacity});
                    if (this.trail.length > 5) this.trail.shift();
                }

                // Party Mode Jitter
                if (isParty) {
                    this.hue = (this.hue + 5) % 360;
                    if (Math.random() > 0.95) this.x += (Math.random() - 0.5) * 10;
                }

                // Bounds Check & Reset
                if (this.y > canvas!.height + 20 || this.y < -20 || this.x > canvas!.width + 20 || this.x < -20) {
                    this.reset();
                }
            }

            reset() {
                this.x = Math.random() * canvas!.width;
                // Respawn logic based on direction
                if (this.speedY > 0) this.y = -20;
                else if (this.speedY < 0) this.y = canvas!.height + 20;
                else this.y = Math.random() * canvas!.height;

                this.opacity = Math.random() * 0.5 + 0.1;
                if (theme.particleType === 'ember') this.opacity = 0.8;
            }

            draw() {
                if (!ctx) return;
                
                // Logic for Colors
                let drawColor = this.customColor || theme.accent;

                // Priority overrides
                if (isParty) {
                    drawColor = `hsl(${this.hue}, 100%, 60%)`;
                } else if (phase === 'revealing' && activeColor && !this.customColor) {
                    drawColor = activeColor;
                } else if (isTroll) {
                     drawColor = Math.random() > 0.8 ? '#ef4444' : (this.customColor || theme.accent);
                }

                ctx.fillStyle = drawColor;
                ctx.globalAlpha = this.opacity;

                // --- PREMIUM DRAWING ---

                if (theme.particleType === 'goldleaf') {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.rotation * Math.PI / 180);
                    // Metallic effect simulation via gradient or simple shape
                    ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
                    ctx.restore();
                } else if (theme.particleType === 'silk') {
                    // Thin lines
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    // Optional trail for silk?
                } else if (theme.particleType === 'aurora') {
                    // Vertical ribbons (simulated as elongated ellipses)
                    ctx.beginPath();
                    ctx.ellipse(this.x, this.y, this.size, this.size * 4, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else if (theme.particleType === 'circle' || theme.particleType === 'stardust' || theme.particleType === 'plankton' || theme.particleType === 'ember') {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                } else if (theme.particleType === 'foliage') {
                     // Simple leaf shape approximation
                     ctx.save();
                     ctx.translate(this.x, this.y);
                     ctx.rotate(this.rotation * Math.PI / 180);
                     ctx.beginPath();
                     ctx.ellipse(0, 0, this.size, this.size/2, 0, 0, Math.PI * 2);
                     ctx.fill();
                     ctx.restore();
                } else {
                    // Text based (Binary/Rain)
                    ctx.font = `${this.size}px ${theme.font}`;
                    ctx.fillText(this.char, this.x, this.y);
                }

                // Cyber Theme Trails
                if (theme.name === "Night City" && this.trail.length > 0 && !isParty) {
                    for (let i = 0; i < this.trail.length; i++) {
                        const point = this.trail[i];
                        const trailOpacity = (i / this.trail.length) * this.opacity * 0.5;
                        ctx.fillStyle = phase === 'revealing' && activeColor ? activeColor : theme.accent;
                        ctx.globalAlpha = trailOpacity;
                        ctx.fillText(this.char, point.x, point.y);
                    }
                }
            }
        }

        const initParticles = () => {
            particles = [];
            let count = theme.particleCount || (theme.particleType === 'circle' ? 60 : 100);
            if (isTroll || isParty) count *= 2;
            
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
                        background: useActiveColor ? activeColor : (isLuminous ? '#FCD34D' : '#00D1FF'),
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
                        background: useActiveColor ? activeColor : (isLuminous ? '#F472B6' : '#BD00FF'),
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
                        background: useActiveColor ? activeColor : (isLuminous ? '#67E8F9' : '#00FF85'),
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
            className="fixed inset-0 pointer-events-none z-0 opacity-60 transition-opacity duration-1000"
            style={{ filter: theme.blur ? `blur(${parseInt(theme.blur)/10}px)` : 'none' }}
        />
    );
};