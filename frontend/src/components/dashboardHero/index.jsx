"use client";

import React from "react";
import "./dashboardHero.css"; 

export default function DashboardHero() {
  return (
    <div className="dashboard-card">
      <div className="dash-header">
        <div className="dash-title-group">
          <div className="dash-title">
            <span className="bolt-icon"><i className="bi bi-lightning-charge"></i></span>
            <h4>Visão geral de energia</h4>
          </div>
          <span className="dash-subtitle">Unidade São Paulo • Exemplo</span>
        </div>
        <div className="dash-status-group">
          <div className="status-live">
            <span className="status-dot"></span> Ao vivo
          </div>
          <button type="button" className="dash-dropdown">Este mês ▾</button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Consumo atual</span>
          <span className="metric-value">42,8 kW</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Economia no mês</span>
          <span className="metric-value highlight">R$ 3.000</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Eficiência</span>
          <span className="metric-value highlight">+24,6%</span>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <span>Consumo ao longo do dia</span>
          <span className="chart-unit">kWh</span>
        </div>

        <div className="svg-wrapper">
          <svg viewBox="0 0 500 160" className="chart-svg">
            <line x1="0" y1="20" x2="500" y2="20" stroke="#1f2333" strokeDasharray="3 3" />
            <line x1="0" y1="70" x2="500" y2="70" stroke="#1f2333" strokeDasharray="3 3" />
            <line x1="0" y1="120" x2="500" y2="120" stroke="#1f2333" strokeDasharray="3 3" />

            <path
              d="M 0,110 Q 50,130 100,100 T 200,40 T 300,70 T 400,50 T 500,90"
              fill="none"
              stroke="#4a5068"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            <path
              d="M 0,90 Q 50,70 100,85 T 200,35 T 300,75 T 400,60 T 500,100"
              fill="none"
              stroke="#2979ff"
              strokeWidth="2.5"
            />
          </svg>

          <div className="chart-labels-x">
            <span>00h</span>
            <span>06h</span>
            <span>12h</span>
            <span>18h</span>
            <span>24h</span>
          </div>
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <span className="dot blue"></span> Com Volt House
          </div>
          <div className="legend-item">
            <span className="dot dashed"></span> Consumo de referência
          </div>
        </div>
      </div>

      <div className="ai-alert">
        <span>IA identificou uma oportunidade de economia de 18% na climatização.</span>
      </div>

      <div className="dash-footer">
        <span><i className="bi bi-graph-up"></i></span> Menos desperdício. Mais resultado.
      </div>
    </div>
  );
}