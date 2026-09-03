* {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
}

html {
    scroll-behavior: smooth;
}

body {
    margin: 0;
    min-height: 100vh;
    font-family: Arial, Helvetica, sans-serif;
    background: #080808;
    color: #ffffff;
    transition: background 0.3s, color 0.3s;
    overflow-x: hidden;
}

button,
a,
input {
    font: inherit;
}

button {
    cursor: pointer;
}

.background-name {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    pointer-events: none;
    user-select: none;
    font-size: clamp(60px, 15vw, 180px);
    font-weight: 900;
    color: rgba(255,255,255,0.025);
    white-space: nowrap;
}

.cursor {
    opacity: 0.5;
    animation: blink 0.8s infinite;
}

@keyframes blink {
    50% {
        opacity: 0;
    }
}

.top-controls {
    position: fixed;
    top: 15px;
    right: 15px;
    z-index: 1000;
    display: flex;
    gap: 7px;
}

.top-controls button {
    border: 1px solid #333;
    background: rgba(20,20,20,0.95);
    color: white;
    border-radius: 10px;
    min-width: 42px;
    height: 40px;
    padding: 0 10px;
}

.top-controls button:hover,
.top-controls button.active {
    background: white;
    color: black;
}

.container {
    position: relative;
    z-index: 10;
    width: min(900px, calc(100% - 30px));
    margin: auto;
    padding-top: 100px;
}

.header {
    text-align: center;
    margin-bottom: 60px;
}

.logo {
    width: 72px;
    height: 72px;
    margin: auto;
    display: grid;
    place-items: center;
    border-radius: 20px;
    background: white;
    color: black;
    font-size: 40px;
    font-weight: 900;
    animation: logoFloat 2.5s ease-in-out infinite;
}

@keyframes logoFloat {
    50% {
        transform: translateY(-7px) rotate(2deg);
    }
}

.header h1 {
    margin: 20px 0 8px;
    font-size: 45px;
}

.header p {
    color: #999;
}

.type-section {
    text-align: center;
}

.type-section h2,
.convert-section h2 {
    font-size: 24px;
}

.type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    margin-top: 25px;
}

.type-card {
    min-height: 180px;
    border: 1px solid #292929;
    border-radius: 20px;
    background: #111;
    color: white;
    padding: 25px 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 9px;
    transition: 0.2s;
}

.type-card:hover {
    transform: translateY(-4px);
    border-color: white;
}

.type-card.active {
    background: white;
    color: black;
}

.type-icon {
    font-size: 42px;
}

.type-card small {
    color: #999;
}

.type-card.active small {
    color: #555;
}

.tool-section {
    margin-top: 70px;
}

.hidden {
    display: none !important;
}

.tool-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
}

.tool-title span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #00ff88;
}

.file-box {
    position: relative;
    min-height: 230px;
    border: 2px dashed #333;
    border-radius: 22px;
    background: #101010;
    display: grid;
    place-items: center;
    text-align: center;
    overflow: hidden;
}

.file-box:hover {
    border-color: #777;
}

#fileInput {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 5;
}

#emptyFile {
    position: relative;
    z-index: 2;
    pointer-events: none;
}

.upload-icon {
    width: 55px;
    height: 55px;
    border-radius: 50%;
    background: white;
    color: black;
    display: grid;
    place-items: center;
    margin: auto;
    font-size: 30px;
}

#emptyFile h3 {
    margin-bottom: 5px;
}

#emptyFile p {
    color: #aaa;
}

#emptyFile small {
    color: #666;
}

.selected-file {
    position: relative;
    z-index: 10;
    width: 100%;
    min-height: 210px;
    padding: 30px 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 25px;
}

.remove-file {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 20;
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 50%;
    background: #222;
    color: white;
    font-size: 25px;
}

.remove-file:hover {
    background: #fff;
    color: #000;
}

.preview {
    width: 110px;
    height: 110px;
    border-radius: 16px;
    overflow: hidden;
    background: #181818;
    display: grid;
    place-items: center;
    font-size: 50px;
    flex-shrink: 0;
}

.preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.file-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
    overflow: hidden;
}

.file-info strong {
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-info span {
    color: #888;
}

.convert-section {
    margin-top: 35px;
}

.format-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin: 20px 0;
}

.format-option {
    height: 55px;
    border: 1px solid #333;
    border-radius: 12px;
    background: #111;
    color: white;
}

.format-option:hover,
.format-option.active {
    background: white;
    color: black;
}

#conversionText {
    color: #888;
    text-align: center;
}

.convert-button {
    width: 100%;
    height: 58px;
    border: 0;
    border-radius: 15px;
    background: white;
    color: black;
    font-weight: 800;
    margin-top: 10px;
}

.convert-button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.progress-section {
    margin-top: 30px;
    padding: 20px;
    border-radius: 17px;
    background: #111;
}

.progress-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
}

.progress-top span {
    color: #aaa;
}

.progress-track {
    width: 100%;
    height: 10px;
    border-radius: 10px;
    background: #292929;
    overflow: hidden;
}

#progressBar {
    width: 0%;
    height: 100%;
    background: white;
    transition: width 0.15s;
}

.result-section {
    margin-top: 30px;
    padding: 35px;
    text-align: center;
    border: 1px solid #292929;
    border-radius: 20px;
    background: #101010;
}

.success {
    width: 60px;
    height: 60px;
    margin: auto;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #00ff88;
    color: black;
    font-size: 35px;
    font-weight: bold;
}

.result-section p {
    color: #888;
}

#downloadButton {
    width: 100%;
    height: 55px;
    border: 0;
    border-radius: 13px;
    background: white;
    color: black;
    font-weight: bold;
}

.big-space {
    height: 600px;
}

footer {
    text-align: center;
    padding: 50px 10px;
    border-top: 1px solid #222;
    color: #777;
}

footer a {
    color: white;
    text-decoration: none;
}

footer a:hover {
    text-decoration: underline;
}

#toast {
    position: fixed;
    left: 50%;
    bottom: 25px;
    transform: translate(-50%, 100px);
    z-index: 2000;
    background: white;
    color: black;
    padding: 13px 20px;
    border-radius: 12px;
    opacity: 0;
    transition: 0.25s;
    pointer-events: none;
}

#toast.show {
    opacity: 1;
    transform: translate(-50%, 0);
}

/* PHONE */

body.phone-mode .container {
    width: calc(100% - 24px);
    padding-top: 85px;
}

body.phone-mode .header {
    margin-bottom: 40px;
}

body.phone-mode .header h1 {
    font-size: 34px;
}

body.phone-mode .logo {
    width: 62px;
    height: 62px;
    font-size: 34px;
}

body.phone-mode .type-grid {
    grid-template-columns: 1fr;
}

body.phone-mode .type-card {
    min-height: 115px;
    flex-direction: row;
    justify-content: flex-start;
    padding: 15px 20px;
}

body.phone-mode .type-icon {
    font-size: 32px;
}

body.phone-mode .selected-file {
    flex-direction: column;
    padding: 45px 20px 25px;
}

body.phone-mode .file-info {
    text-align: center;
    max-width: 100%;
}

body.phone-mode .file-info strong {
    max-width: 250px;
}

body.phone-mode .format-grid {
    grid-template-columns: repeat(2, 1fr);
}

body.phone-mode .big-space {
    height: 400px;
}

/* DESKTOP */

body.desktop-mode .container {
    max-width: 1050px;
}

body.desktop-mode .type-card {
    min-height: 200px;
}

/* LIGHT */

body.light {
    background: #f4f4f4;
    color: #111;
}

body.light .background-name {
    color: rgba(0,0,0,0.035);
}

body.light .top-controls button {
    background: white;
    color: black;
    border-color: #ddd;
}

body.light .type-card,
body.light .file-box,
body.light .progress-section,
body.light .result-section {
    background: white;
    color: #111;
    border-color: #ddd;
}

body.light .type-card small,
body.light #emptyFile p,
body.light .file-info span,
body.light #conversionText,
body.light .progress-top span {
    color: #777;
}

body.light .format-option {
    background: white;
    color: #111;
    border-color: #ddd;
}

body.light .format-option:hover,
body.light .format-option.active {
    background: #111;
    color: white;
}

body.light .progress-track {
    background: #ddd;
}

body.light #progressBar {
    background: #111;
}

body.light .remove-file {
    background: #eee;
    color: #111;
}

body.light footer {
    border-color: #ddd;
}

body.light footer a {
    color: #111;
}

@media (max-width: 650px) {
    .top-controls {
        top: 10px;
        right: 10px;
    }

    .top-controls button {
        min-width: 38px;
        height: 36px;
        padding: 0 8px;
    }
}