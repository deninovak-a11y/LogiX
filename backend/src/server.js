@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  font-family: 'Inter', sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #0f172a;
  background: #f5f7fb;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  min-height: 100%;
  background: #f5f7fb;
}

body {
  min-height: 100vh;
}

button, input, select, textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

textarea {
  resize: vertical;
}

.auth-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f172a, #0f766e);
  padding: 24px;
}

.auth-card {
  width: min(100%, 460px);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(14px);
  border-radius: 18px;
  padding: 28px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
}

.brand-line {
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #0f766e;
  font-weight: 800;
}

.auth-card h1 {
  margin: 10px 0 8px;
  font-size: 2rem;
}

.auth-card p {
  margin: 0 0 20px;
  color: #475569;
}

.auth-form,
.stacked-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-form label,
.stacked-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 500;
  color: #334155;
}

input, select, textarea {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
}

button.primary-button {
  border: none;
  background: #0f766e;
  color: white;
  padding: 12px 18px;
  border-radius: 10px;
  font-weight: 700;
}

button.primary-button:hover {
  background: #0d5e5a;
}

button.ghost-button {
  border: 1px solid #cbd5e1;
  background: white;
  color: #0f172a;
  padding: 8px 12px;
  border-radius: 10px;
}

button.mini-button {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  padding: 8px 10px;
  border-radius: 8px;
}

.app-shell {
  max-width: 1500px;
  margin: 0 auto;
  padding: 24px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.topbar h2 {
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-card span {
  color: #64748b;
  font-size: 0.9rem;
}

.stat-card strong {
  font-size: 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.95fr;
  gap: 20px;
  margin-bottom: 24px;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.panel h3 {
  margin-top: 0;
  margin-bottom: 18px;
}

.grid-two,
.grid-four {
  display: grid;
  gap: 12px;
}

.grid-two {
  grid-template-columns: 1fr 1fr;
}

.grid-four {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.split-forms {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 18px;
}

.mini-form {
  gap: 12px;
}

.simple-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 14px;
}

.map-panel {
  margin-bottom: 24px;
}

.plan-header, .detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.plan-actions, .detail-actions, .toolbar-row, .inline-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.map-grid {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 20px;
}

.map-wrapper {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.tour-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tour-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #f8fafc;
}

.tour-card h4 {
  margin: 0 0 6px;
}

.tiny-meta {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 8px;
}

.tour-card ul {
  margin: 0;
  padding-left: 18px;
  color: #334155;
}

.detail-panel {
  margin-bottom: 24px;
}

.detail-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 12px 10px;
  border-bottom: 1px solid #e2e8f0;
}

th {
  color: #475569;
  font-weight: 700;
}

.error-box {
  background: #fff1f2;
  color: #be123c;
  border: 1px solid #fecdd3;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 16px;
}

.clickable-cell {
  cursor: pointer;
  color: #0f766e;
  font-weight: 600;
}

.empty-state {
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 18px;
  text-align: center;
  color: #64748b;
  background: #f8fafc;
}

@media (max-width: 980px) {
  .content-grid,
  .map-grid,
  .stats-grid,
  .grid-two,
  .grid-four,
  .split-forms {
    grid-template-columns: 1fr;
  }

  .topbar,
  .plan-header,
  .detail-header,
  .list-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-row,
  .inline-actions {
    flex-wrap: wrap;
  }
}
