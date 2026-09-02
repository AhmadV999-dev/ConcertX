* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #070707;
  --surface: #0d0d0f;
  --surface-2: #111114;
  --surface-3: #17171b;
  --border: #25252b;
  --border-light: #33333a;
  --text: #f7f7f8;
  --muted: #92929b;
  --muted-2: #696971;
  --white: #ffffff;
  --shadow: 0 25px 80px rgba(0, 0, 0, 0.55);
  --radius: 18px;
}

html {
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 50% -10%,
      #1c1c22 0,
      #0b0b0d 35%,
      #070707 70%
    );
  color: var(--text);
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

a {
  color: inherit;
}

.hidden {
  display: none !important;
}


/* =================================
   LOGIN PAGE
================================= */

.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 25px;
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: "";
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.035);
  filter: blur(80px);
  top: -250px;
  left: 50%;
  transform: translateX(-50%);
}

.login-box {
  width: 100%;
  max-width: 430px;
  position: relative;
  z-index: 1;
  padding: 42px 34px;
  text-align: center;
  background: rgba(15, 15, 18, 0.88);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(20px);
}

.logo {
  font-size: 30px;
  font-weight: 850;
  letter-spacing: -1.5px;
}

.login-box h1 {
  margin-top: 30px;
  font-size: 29px;
  line-height: 1.15;
  letter-spacing: -1px;
}

.login-box p {
  margin-top: 10px;
  color: var(--muted);
  font-size: 15px;
}

.google-button {
  width: 100%;
  margin-top: 30px;
  min-height: 52px;
  padding: 14px 18px;
  border: 1px solid #dedede;
  border-radius: 12px;
  background: #fff;
  color: #111;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  transition:
    transform 0.18s ease,
    background 0.18s ease;
}

.google-button:hover {
  background: #eeeeee;
  transform: translateY(-1px);
}

.google-button:active {
  transform: translateY(0);
}

.google-button span {
  font-size: 21px;
  font-weight: 900;
}

.login-box small,
.modal-box small {
  display: block;
  margin-top: 17px;
  color: var(--muted-2);
  font-size: 12px;
}


/* =================================
   GMAIL MODAL
================================= */

.modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(10px);
}

.modal-box {
  width: 100%;
  max-width: 410px;
  padding: 35px;
  text-align: center;
  background: #101012;
  border: 1px solid var(--border-light);
  border-radius: 22px;
  box-shadow:
    0 30px 100px rgba(0, 0, 0, 0.8);
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.google-logo {
  width: 52px;
  height: 52px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: #fff;
  color: #4285f4;
  font-size: 26px;
  font-weight: 900;
}

.modal-box h2 {
  font-size: 27px;
  letter-spacing: -0.5px;
}

.modal-box p {
  margin-top: 9px;
  color: var(--muted);
  line-height: 1.5;
  font-size: 14px;
}

.modal-box input {
  width: 100%;
  height: 51px;
  margin-top: 23px;
  padding: 0 15px;
  outline: none;
  border: 1px solid var(--border-light);
  border-radius: 11px;
  background: #080809;
  color: #fff;
  transition: border 0.2s ease;
}

.modal-box input:focus {
  border-color: #777780;
}

.modal-box button {
  width: 100%;
  min-height: 49px;
  margin-top: 12px;
  border: 0;
  border-radius: 11px;
  background: #fff;
  color: #111;
  font-weight: 750;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
}

.modal-box button:hover {
  background: #ededed;
  transform: translateY(-1px);
}

.modal-box .secondary-button {
  background: #19191c;
  color: #fff;
  border: 1px solid var(--border);
}

.modal-box .secondary-button:hover {
  background: #202024;
}


/* =================================
   MAIN APP
================================= */

.app {
  min-height: 100vh;
}


/* =================================
   NAVBAR
================================= */

.navbar {
  height: 72px;
  padding: 0 max(25px, calc((100% - 1180px) / 2));
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(7, 7, 7, 0.82);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(18px);
}

.brand {
  font-size: 23px;
  font-weight: 850;
  letter-spacing: -1px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 9px;
}

.token-display,
.profile-button,
.logout-button {
  height: 40px;
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #111113;
  color: #fff;
}

.token-display {
  padding: 0 13px;
  font-size: 13px;
  font-weight: 650;
}

.profile-button,
.logout-button {
  padding: 0 13px;
}

.profile-button:hover,
.logout-button:hover {
  background: #19191c;
  border-color: #38383e;
}


/* =================================
   MAIN CONTAINER
================================= */

.container {
  width: min(1100px, calc(100% - 32px));
  margin: 0 auto;
  padding: 55px 0 100px;
}


/* =================================
   ACCOUNT CARD
================================= */

.account-card {
  min-height: 76px;
  padding: 17px 20px;
  margin-bottom: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  background: rgba(15, 15, 18, 0.75);
  border: 1px solid var(--border);
  border-radius: 14px;
}

.account-card div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.account-card strong {
  font-size: 14px;
  font-weight: 650;
}

.label {
  color: var(--muted-2);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}


/* =================================
   PAGE HEADING
================================= */

.page-heading {
  text-align: center;
  margin-bottom: 28px;
}

.page-heading h1 {
  font-size: clamp(34px, 5vw, 48px);
  line-height: 1;
  letter-spacing: -2px;
  font-weight: 850;
}

.page-heading p {
  margin-top: 12px;
  color: var(--muted);
  font-size: 15px;
}


/* =================================
   CONVERTER TYPE SELECTOR
================================= */

.converter-types {
  width: 100%;
  max-width: 850px;
  margin: 0 auto 18px;
  padding: 5px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  background: #0d0d0f;
  border: 1px solid var(--border);
  border-radius: 14px;
}

.converter-type {
  min-height: 58px;
  padding: 10px 15px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #d8d8dc;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  flex-direction: column;
  transition:
    background 0.18s ease,
    border 0.18s ease;
}

.converter-type strong {
  font-size: 13px;
  font-weight: 700;
}

.converter-type span {
  color: var(--muted-2);
  font-size: 11px;
}

.converter-type:hover {
  background: #151518;
}

.converter-type.active {
  background: #1b1b1f;
  border-color: #34343b;
  color: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.converter-type.active span {
  color: #aaaab2;
}


/* =================================
   BIG UPLOAD BOX
================================= */

.upload-area {
  width: 100%;
  min-height: 410px;
  padding: 50px 25px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  background:
    radial-gradient(
      circle at 50% 40%,
      rgba(255, 255, 255, 0.035),
      transparent 45%
    ),
    #0c0c0f;

  border: 1px dashed #38383f;
  border-radius: 22px;

  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3);

  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.upload-area:hover {
  border-color: #62626a;
  background:
    radial-gradient(
      circle at 50% 40%,
      rgba(255, 255, 255, 0.045),
      transparent 45%
    ),
    #101013;
}

.upload-area.dragging {
  border-color: #aaaab2;
  background: #151519;
  transform: scale(1.005);
}

.upload-icon {
  width: 76px;
  height: 76px;
  margin-bottom: 23px;
  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 20px;
  background: #18181c;
  border: 1px solid #29292f;

  font-size: 36px;
  font-weight: 300;
  color: #eeeeef;

  box-shadow:
    0 12px 35px rgba(0, 0, 0, 0.4);
}

.upload-area h2 {
  font-size: 23px;
  font-weight: 750;
  letter-spacing: -0.5px;
}

.upload-area p {
  max-width: 500px;
  margin-top: 9px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

#chooseFileButton {
  min-width: 150px;
  height: 47px;
  margin-top: 25px;
  padding: 0 23px;

  border: 0;
  border-radius: 10px;

  background: #fff;
  color: #111;

  font-size: 14px;
  font-weight: 750;

  transition:
    transform 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

#chooseFileButton:hover {
  background: #eeeeee;
  transform: translateY(-2px);
  box-shadow:
    0 8px 25px rgba(255, 255, 255, 0.08);
}

#chooseFileButton:active {
  transform: translateY(0);
}

.conversion-cost {
  margin-top: 17px;
  color: var(--muted-2);
  font-size: 12px;
}

.conversion-cost strong {
  color: #bcbcc2;
  font-weight: 650;
}


/* =================================
   FILE INFO
================================= */

.file-info {
  width: 100%;
  margin-top: 13px;
  padding: 15px 17px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;

  background: #101013;
  border: 1px solid var(--border);
  border-radius: 13px;

  animation: slideUp 0.18s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.file-details {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.file-details strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.file-details span {
  color: var(--muted-2);
  font-size: 12px;
}

#clearButton {
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid #303036;
  border-radius: 8px;
  background: transparent;
  color: #ccc;
  font-size: 12px;
}

#clearButton:hover {
  background: #1b1b1f;
  color: #fff;
}


/* =================================
   PREVIEW
================================= */

.preview {
  width: 100%;
  margin-top: 14px;
  padding: 17px;

  background: #0d0d10;
  border: 1px solid var(--border);
  border-radius: 15px;
}

.preview-image,
.preview-video {
  display: block;
  max-width: 100%;
  max-height: 500px;
  margin: 0 auto;
  border-radius: 11px;
  object-fit: contain;
}

.preview-audio {
  display: block;
  width: 100%;
}


/* =================================
   PROGRESS
================================= */

.progress-container {
  width: 100%;
  margin-top: 17px;
  padding: 13px 15px;

  display: flex;
  align-items: center;
  gap: 12px;

  background: #101013;
  border: 1px solid var(--border);
  border-radius: 11px;
}

progress {
  width: 100%;
  height: 7px;
  appearance: none;
  border: 0;
  overflow: hidden;
  border-radius: 20px;
}

progress::-webkit-progress-bar {
  background: #222228;
  border-radius: 20px;
}

progress::-webkit-progress-value {
  background: #fff;
  border-radius: 20px;
}

progress::-moz-progress-bar {
  background: #fff;
  border-radius: 20px;
}

#progressText {
  min-width: 38px;
  color: #9999a2;
  font-size: 12px;
  text-align: right;
}


/* =================================
   CONVERT BUTTON
================================= */

.convert-button {
  width: 100%;
  height: 55px;
  margin-top: 17px;

  border: 0;
  border-radius: 12px;

  background: #fff;
  color: #111;

  font-size: 15px;
  font-weight: 800;

  transition:
    transform 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.convert-button:not(:disabled):hover {
  background: #eeeeee;
  transform: translateY(-2px);
  box-shadow:
    0 12px 30px rgba(255, 255, 255, 0.08);
}

.convert-button:not(:disabled):active {
  transform: translateY(0);
}

.convert-button:disabled {
  opacity: 0.32;
}


/* =================================
   RESULT
================================= */

.result-card {
  width: 100%;
  margin-top: 20px;
  padding: 23px;

  background: #101013;
  border: 1px solid #303036;
  border-radius: 16px;

  box-shadow:
    0 15px 45px rgba(0, 0, 0, 0.25);

  animation: slideUp 0.2s ease;
}

.result-card h2 {
  margin-bottom: 17px;
  font-size: 20px;
}

.result-info {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.result-info strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-info span {
  flex-shrink: 0;
  color: var(--muted);
  font-size: 13px;
}

.download-button {
  width: 100%;
  display: block;
  margin-top: 18px;
  padding: 14px;

  border-radius: 10px;

  background: #fff;
  color: #111;

  text-align: center;
  text-decoration: none;

  font-size: 14px;
  font-weight: 800;

  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

.download-button:hover {
  background: #ededed;
  transform: translateY(-1px);
}


/* =================================
   REDEEM SECTION
================================= */

.redeem-section {
  max-width: 850px;
  margin: 65px auto 0;
  padding-top: 50px;
  border-top: 1px solid #1c1c20;
}

.section-heading {
  text-align: center;
}

.section-heading h2 {
  font-size: 24px;
  letter-spacing: -0.5px;
}

.section-heading p {
  margin-top: 7px;
  color: var(--muted);
  font-size: 14px;
}

.redeem-box {
  margin-top: 19px;
  display: flex;
  gap: 9px;
}

.redeem-box input {
  flex: 1;
  min-width: 0;
  height: 48px;
  padding: 0 14px;

  outline: none;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: #101013;
  color: #fff;

  transition: border 0.18s ease;
}

.redeem-box input:focus {
  border-color: #55555d;
}

.redeem-box button {
  min-width: 110px;
  height: 48px;

  border: 0;
  border-radius: 10px;

  background: #fff;
  color: #111;

  font-weight: 750;
}

.redeem-box button:hover {
  background: #ededed;
}


/* =================================
   ADMIN PANEL
================================= */

.admin-panel {
  max-width: 1000px;
  margin: 65px auto 0;
  padding: 25px;

  background:
    linear-gradient(
      145deg,
      #101013,
      #0b0b0d
    );

  border: 1px solid #35353b;
  border-radius: 18px;

  box-shadow:
    0 20px 70px rgba(0, 0, 0, 0.35);
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 21px;
}

.admin-header h2 {
  font-size: 23px;
}

.admin-header p {
  margin-top: 6px;
  color: var(--muted);
  font-size: 13px;
}

.admin-badge {
  padding: 7px 10px;
  border-radius: 7px;
  background: #fff;
  color: #111;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.5px;
}

.admin-card {
  margin-top: 13px;
  padding: 18px;

  background: #0d0d10;
  border: 1px solid var(--border);
  border-radius: 13px;
}

.admin-card h3 {
  margin-bottom: 14px;
  font-size: 15px;
}

.admin-form {
  display: grid;
  grid-template-columns: 1fr 120px 190px auto;
  gap: 8px;
}

.admin-form input {
  min-width: 0;
  height: 43px;
  padding: 0 11px;

  outline: none;

  border: 1px solid #29292f;
  border-radius: 9px;

  background: #080809;
  color: #fff;
}

.admin-form input:focus {
  border-color: #55555d;
}

.admin-form button {
  height: 43px;
  padding: 0 15px;

  border: 0;
  border-radius: 9px;

  background: #fff;
  color: #111;

  font-weight: 750;
}

.admin-form button:hover {
  background: #ededed;
}

.admin-code-row,
.admin-user-row {
  margin-top: 8px;
  padding: 13px;

  background: #0a0a0c;
  border: 1px solid #222228;
  border-radius: 10px;
}

.admin-code-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.delete-code {
  flex-shrink: 0;

  padding: 7px 10px;

  border: 1px solid #3a2929;
  border-radius: 7px;

  background: transparent;
  color: #ff8585;

  font-size: 12px;
}

.delete-code:hover {
  background: #241515;
}


/* =================================
   NOTIFICATIONS
================================= */

#messageContainer {
  position: relative;
  z-index: 9999;
}

.message {
  pointer-events: auto;
  box-shadow:
    0 12px 35px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
}


/* =================================
   MOBILE
================================= */

@media (max-width: 800px) {

  .navbar {
    padding: 0 17px;
  }

  .container {
    width: min(100% - 22px, 1100px);
    padding-top: 32px;
  }

  .account-card {
    margin-bottom: 34px;
  }

  .converter-types {
    grid-template-columns: 1fr;
  }

  .converter-type {
    min-height: 52px;
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
    padding: 10px 14px;
  }

  .upload-area {
    min-height: 360px;
  }

  .admin-form {
    grid-template-columns: 1fr;
  }
}


@media (max-width: 600px) {

  .login-page {
    padding: 15px;
  }

  .login-box {
    padding: 32px 22px;
    border-radius: 20px;
  }

  .login-box h1 {
    font-size: 25px;
  }

  .modal {
    padding: 14px;
  }

  .modal-box {
    padding: 28px 20px;
    border-radius: 18px;
  }

  .navbar {
    height: 64px;
  }

  .brand {
    font-size: 21px;
  }

  .profile-button {
    display: none;
  }

  .token-display {
    height: 38px;
    padding: 0 10px;
  }

  .logout-button {
    height: 38px;
    padding: 0 10px;
    font-size: 12px;
  }

  .account-card {
    align-items: flex-start;
    flex-direction: column;
    padding: 16px;
  }

  .page-heading h1 {
    font-size: 35px;
    letter-spacing: -1.5px;
  }

  .page-heading p {
    font-size: 13px;
  }

  .upload-area {
    min-height: 330px;
    padding: 35px 18px;
    border-radius: 18px;
  }

  .upload-icon {
    width: 66px;
    height: 66px;
    border-radius: 17px;
    font-size: 31px;
  }

  .upload-area h2 {
    font-size: 20px;
  }

  .upload-area p {
    font-size: 13px;
  }

  .file-info {
    align-items: flex-start;
  }

  .redeem-section {
    margin-top: 50px;
    padding-top: 40px;
  }

  .redeem-box {
    flex-direction: column;
  }

  .redeem-box button {
    width: 100%;
  }

  .admin-panel {
    padding: 18px;
  }

  .admin-header {
    flex-direction: column;
  }

  .result-info {
    flex-direction: column;
  }
}


@media (max-width: 380px) {

  .container {
    width: calc(100% - 16px);
  }

  .navbar {
    padding: 0 10px;
  }

  .brand {
    font-size: 19px;
  }

  .token-display {
    font-size: 11px;
  }

  .logout-button {
    font-size: 11px;
  }

  .page-heading h1 {
    font-size: 31px;
  }

  .upload-area {
    min-height: 300px;
  }
}
