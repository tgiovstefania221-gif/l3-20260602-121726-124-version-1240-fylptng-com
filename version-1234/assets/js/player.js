import { H as Hls } from './hls-vendor-dru42stk.js';

const configNode = document.getElementById('player-config');
const video = document.getElementById('video-player');
const cover = document.querySelector('[data-play-cover]');
let hasStarted = false;
let hlsInstance = null;

const readConfig = () => {
  if (!configNode) {
    return null;
  }
  try {
    return JSON.parse(configNode.textContent || '{}');
  } catch (error) {
    return null;
  }
};

const startPlayer = async () => {
  const config = readConfig();
  if (!config || !video || !config.source) {
    return;
  }
  if (!hasStarted) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.source;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(config.source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = config.source;
    }
    hasStarted = true;
  }
  if (cover) {
    cover.classList.add('hidden');
  }
  try {
    await video.play();
  } catch (error) {
    video.controls = true;
  }
};

if (cover) {
  cover.addEventListener('click', startPlayer);
}

if (video) {
  video.addEventListener('click', () => {
    if (!hasStarted) {
      startPlayer();
    }
  });
}

window.addEventListener('pagehide', () => {
  if (hlsInstance) {
    hlsInstance.destroy();
  }
});
