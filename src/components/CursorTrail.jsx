import React, { useEffect, useRef } from 'react';

const CursorTrail = () => {
    const canvasRef = useRef(null);
    const pointsRef = useRef([]);
    const cursorRef = useRef({ x: 0, y: 0 });
    const clicksRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const onMouseMove = (e) => {
            cursorRef.current = { x: e.clientX, y: e.clientY };
            // Add point immediately for responsiveness
            pointsRef.current.push({
                x: e.clientX,
                y: e.clientY,
                age: 0,
                vx: 0,
                vy: 0
            });
        };

        const onMouseDown = (e) => {
            clicksRef.current.push({
                x: e.clientX,
                y: e.clientY,
                radius: 0,
                opacity: 1
            });
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);

        const update = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. UPDATE & DRAW TRAIL
            // Filter dead points
            pointsRef.current = pointsRef.current
                .map(p => ({ ...p, age: p.age + 1 }))
                .filter(p => p.age < 25); // Trail length

            // Draw line
            if (pointsRef.current.length > 1) {
                ctx.beginPath();
                ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);

                // Quadratic Bezier for smoothness
                for (let i = 1; i < pointsRef.current.length - 1; i++) {
                    const p1 = pointsRef.current[i];
                    const p2 = pointsRef.current[i + 1];
                    const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
                    ctx.quadraticCurveTo(p1.x, p1.y, mid.x, mid.y);
                }

                // Last point
                const last = pointsRef.current[pointsRef.current.length - 1];
                ctx.lineTo(last.x, last.y);

                // Gradient Stroke
                const gradient = ctx.createLinearGradient(
                    pointsRef.current[0].x, pointsRef.current[0].y,
                    last.x, last.y
                );
                gradient.addColorStop(0, 'rgba(45, 252, 204, 0)'); // Fade out tail
                gradient.addColorStop(1, 'rgba(45, 252, 204, 0.8)'); // Bright head

                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = 2;
                ctx.strokeStyle = gradient;

                // Add Glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#2dfccc';

                ctx.stroke();

                // Reset shadow for other elements
                ctx.shadowBlur = 0;
            }

            // 2. UPDATE & DRAW CLICKS (Ripples)
            clicksRef.current = clicksRef.current.filter(c => c.opacity > 0.01);
            clicksRef.current.forEach(c => {
                c.radius += 2; // Expansion speed
                c.opacity *= 0.92; // Fade speed

                ctx.beginPath();
                ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(217, 43, 107, ${c.opacity})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Inner echo
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.radius * 0.6, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(45, 252, 204, ${c.opacity * 0.5})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            animationFrameId = requestAnimationFrame(update);
        };

        update();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 99999 // Always on top
            }}
        />
    );
};

export default CursorTrail;
