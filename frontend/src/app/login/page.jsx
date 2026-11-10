"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./login.css";

export default function Login() {
  // DECLARAÇÃO DO CANVASREF QUE FALTAVA:
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Configuração das partículas
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.7 - 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }));

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        p.opacity += Math.sin(Date.now() * p.pulseSpeed) * 0.008;
        const clampedOpacity = Math.max(0.1, Math.min(0.8, p.opacity));

        if (p.y < 0) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${clampedOpacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#a855f7";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <main id="login">
      {/* Esferas luminosas em movimento */}
      <div className="bg-glow orb-1"></div>
      <div className="bg-glow orb-2"></div>
      <div className="bg-glow orb-3"></div>

      {/* Canvas para partículas elétricas */}
      <canvas ref={canvasRef} className="particles-canvas" />

      {/* Cartão de Login */}
      <div className="card-login">
        <div className="top-login">
          <img src="/images/logo.png" alt="Volt House" />

          <div className="txt-card-top">
            <h3>Acesse sua conta</h3>
            <span>Entre para acompanhar seu consumo de energia</span>
          </div>
        </div>
        <form>
          <div className="form-group">
            <label>E-mail</label>
            <div className="input-wrapper">
              <i className="bi bi-envelope"></i>
              <input
                type="email"
                name="email"
                placeholder="seuemail@exemplo.com"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Senha</label>
            <div className="input-wrapper">
              <i className="bi bi-lock"></i>
              <input
                type="password"
                name="senha"
                placeholder="Digite sua senha"
                required
              />
            </div>
          </div>
          <Link className="esquecer-senha" href="/">
            Esqueci minha senha
          </Link>

          <div className="btn-entrar">
            <button type="button">Entrar</button>
          </div>
        </form>
      </div>
    </main>
  );
}
