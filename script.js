* {
  box-sizing: border-box;
}

:root {
  --bg: #07080c;
  --panel: #0e1016;
  --panel2: #131620;
  --border: #252936;
  --text: #f4f5f7;
  --muted: #8b91a1;
  --accent: #ffffff;
  --danger: #ff5d70;
  --success: #63e6a8;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at top right, #171b29 0, transparent 35%),
    var(--bg);
  color: var(--text);
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  min-height: 100vh;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.hidden {
  display: none !important;
}

/* LOGIN */

.screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
}

.login-card {
  width: min(420px, 100%);
  background: rgba(14, 16, 22, .92);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 42px 30px;
  text-align: center;
  box-shadow: 0 30px 100px rgba(0,0,0,.45);
}

.brand-big {
  font-size: 40px;
  font-weight: 900;
  letter-spacing: -2px;
}

.brand-big span,
.brand span {
  color: #8e95a8;
}

.muted,
.tiny {
  color: var(--muted);
}

.google-btn {
  width: 100%;
  border: 1px solid #d8dbe2;
  background: white;
  color: #151515;
  border-radius: 12px;
  padding: 14px;
  margin-top: 28px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.google-logo {
  font-weight: 900;
  font-size: 20px;
}

.error {
  color: var(--danger);
  min-height: 20px;
  font-size: 14px;
}

/* NAV */

.navbar {
  height: 72px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 28px;
  background: rgba(7,8,12,.85);
  backdrop-filter: blur(15px);
  position: sticky;
  top: 0;
  z-index: 20;
}

.brand {
  font-size: 23px;
  font-weight: 900;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.token-pill {
  display: flex;
  gap: 7px;
  align-items: center;
  padding: 9px 13px;
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 999px;
  font-size: 13px;
}

.user-box {
  display: flex;
  align-items: center;
  gap: 9px;
}

.user-box img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.user-box small {
  display: block;
  color: var(--muted);
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.small-btn,
.outline-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 13px;
}

/* MAIN */

.container {
  width: min(1050px, calc(100% - 32px));
  margin: auto;
  padding: 60px 0 100px;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
  margin-bottom: 35px;
}

.badge,
.admin-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #a7adbc;
  margin-bottom: 10px;
}

.hero h1 {
  font-size: clamp(42px, 7vw, 72px);
  line-height: .98;
  letter-spacing: -4px;
  margin: 0;
}

.hero h1 span {
  color: #666c7c;
}

.hero p {
  color: var(--muted);
  margin-top: 20px;
}

.panel {
  background: rgba(14,16,22,.94);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 22px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 22px;
}

.panel h2 {
  margin: 0;
}

.panel-head p {
  margin: 5px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.cost {
  background: #191c25;
  border: 1px solid var(--border);
  padding: 8px 12px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 800;
}

/* FORMAT */

.formats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}

.format {
  text-align: left;
  background: var(--panel2);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 15px;
  border-radius: 14px;
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  gap: 10px;
}

.format.active {
  border-color: #777e90;
  background: #191c25;
}

.format-icon {
  font-size: 22px;
}

.format small {
  display: block;
  color: var(--muted);
  margin-top: 3px;
}

.format strong {
  font-size: 12px;
}

/* UPLOAD */

.drop-zone {
  border: 1px dashed #3a3f4d;
  border-radius: 17px;
  min-height: 230px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: .2s;
}

.drop-zone.drag {
  border-color: white;
  background: #12151c;
}

.upload-icon {
  font-size: 40px;
  color: #9ca2b2;
}

.drop-zone h3 {
  margin: 10px 0 5px;
}

.drop-zone p {
  margin: 0 0 18px;
  color: var(--muted);
}

.primary-btn,
.convert-btn,
.download-btn {
  border: 0;
  background: var(--accent);
  color: #08090d;
  font-weight: 800;
  border-radius: 11px;
  padding: 12px 18px;
  text-decoration: none;
}

.convert-btn {
  width: 100%;
  margin-top: 18px;
  padding: 15px;
}

.convert-btn:disabled {
  opacity: .35;
  cursor: not-allowed;
}

/* FILE */

.file-info {
  display: flex;
  align-items: center;
  gap: 13px;
  background: var(--panel2);
  border: 1px solid var(--border);
  border-radius: 13px;
  padding: 13px;
  margin-top: 14px;
}

.file-symbol {
  background: #20232d;
  padding: 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 900;
}

.file-details {
  flex: 1;
}

.file-details span {
  display: block;
  color: var(--muted);
  font-size: 12px;
  margin-top: 3px;
}

.remove-btn {
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 25px;
}

/* PREVIEW */

.preview {
  margin-top: 15px;
  border-radius: 14px;
  overflow: hidden;
  background: #050506;
  border: 1px solid var(--border);
}

.preview img,
.preview video,
.preview audio {
  display: block;
  max-width: 100%;
  max-height: 400px;
  margin: auto;
}

/* PROGRESS */

.progress-box {
  margin-top: 18px;
}

.progress-top {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 13px;
  margin-bottom: 8px;
}

.progress {
  height: 7px;
  background: #20232c;
  border-radius: 99px;
  overflow: hidden;
}

.progress div {
  width: 0%;
  height: 100%;
  background: white;
  transition: width .2s;
}

/* RESULT */

.result {
  margin-top: 18px;
  padding: 15px;
  background: #101d17;
  border: 1px solid #274634;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.result span {
  display: block;
  color: var(--muted);
  font-size: 12px;
  margin-top: 4px;
}

.download-btn {
  white-space: nowrap;
}

/* REDEEM */

.redeem-row {
  display: flex;
  gap: 10px;
}

.text-input {
  width: 100%;
  background: #090a0e;
  border: 1px solid var(--border);
  color: white;
  padding: 12px;
  border-radius: 10px;
  outline: none;
}

.text-input:focus {
  border-color: #697080;
}

.message {
  min-height: 20px;
  font-size: 13px;
}

/* ADMIN */

.admin-badge {
  color: #d7d9df;
}

.admin-card {
  background: #0a0c11;
  border: 1px solid var(--border);
  border-radius: 15px;
  padding: 18px;
  margin-top: 16px;
}

.admin-card h3 {
  margin-top: 0;
}

.admin-card p {
  color: var(--muted);
  font-size: 13px;
}

.admin-grid {
  display: grid;
  grid-template-columns: 1fr 150px 210px;
  gap: 12px;
  margin-bottom: 15px;
}

.admin-grid label span {
  display: block;
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 6px;
}

.admin-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.users-list {
  display: grid;
  gap: 10px;
}

.user-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 15px;
  padding: 14px;
  background: var(--panel2);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.user-main {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-main img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-main small {
  display: block;
  color: var(--muted);
}

.permission-box {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: end;
}

.permission {
  font-size: 11px;
  padding: 6px 8px;
  border-radius: 7px;
  background: #20232c;
  color: #b5bac6;
}

.permission.on {
  background: #193c2b;
  color: var(--success);
}

.permission.off {
  background: #331a20;
  color: #ff8b98;
}

.admin-user-controls {
  margin-top: 10px;
  display: flex;
  gap: 7px;
  justify-content: end;
}

.toggle-btn {
  border: 1px solid var(--border);
  background: #171a22;
  color: white;
  padding: 6px 9px;
  border-radius: 7px;
  font-size: 11px;
}

/* MOBILE */

@media (max-width: 760px) {

  .navbar {
    height: auto;
    padding: 14px;
    gap: 12px;
    flex-wrap: wrap;
  }

  .nav-right {
    width: 100%;
    justify-content: space-between;
  }

  .user-box {
    display: none;
  }

  .container {
    width: min(100% - 20px, 1050px);
    padding-top: 35px;
  }

  .hero {
    align-items: start;
    flex-direction: column;
  }

  .hero h1 {
    letter-spacing: -2px;
  }

  .formats {
    grid-template-columns: 1fr;
  }

  .admin-grid {
    grid-template-columns: 1fr;
  }

  .redeem-row {
    flex-direction: column;
  }

  .result {
    flex-direction: column;
    align-items: stretch;
  }

  .download-btn {
    text-align: center;
  }

  .user-row {
    grid-template-columns: 1fr;
  }

  .permission-box {
    justify-content: start;
  }

}
