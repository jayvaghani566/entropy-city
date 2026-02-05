
export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    /**
     * @param {number} x - Screen X
     * @param {number} y - Screen Y
     * @param {string} type - 'spark', 'smoke', 'data'
     */
    emit(x, y, type) {
        const p = {
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1.0,
            type
        };

        if (type === 'spark') {
            p.color = '#ffff00';
            p.vy = (Math.random() - 1) * 3; // Upwards
            p.decay = 0.05;
        } else if (type === 'smoke') {
            p.color = '#555555';
            p.vx *= 0.5;
            p.vy = -1 - Math.random(); // Up
            p.decay = 0.02;
            p.size = 5 + Math.random() * 5;
        } else if (type === 'data') {
            p.color = '#00ff00';
            p.decay = 0.05;
        }

        this.particles.push(p);
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw(ctx) {
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;

            if (p.type === 'disk' || p.type === 'smoke') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(p.x, p.y, 2, 2);
            }
        });
        ctx.globalAlpha = 1.0;
    }
}
