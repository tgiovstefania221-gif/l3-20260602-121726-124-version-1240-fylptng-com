import { H as Hls } from './hls-vendor-dru42stk.js';

function initializePlayer(wrapper) {
    var video = wrapper.querySelector('.js-video');
    var startButton = wrapper.querySelector('.js-player-start');
    var source = wrapper.getAttribute('data-video-src');
    var hlsInstance = null;
    var initialized = false;

    if (!video || !source) {
        return;
    }

    function loadSource() {
        if (initialized) {
            return Promise.resolve();
        }

        initialized = true;

        if (Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    console.error('HLS fatal error:', data);
                }
            });

            return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return Promise.resolve();
        }

        wrapper.classList.add('is-player-error');
        return Promise.reject(new Error('当前浏览器不支持 HLS 播放'));
    }

    function playVideo() {
        loadSource()
            .then(function () {
                return video.play();
            })
            .then(function () {
                if (startButton) {
                    startButton.classList.add('is-hidden');
                }
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    if (startButton) {
        startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
        if (startButton) {
            startButton.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (startButton && video.currentTime === 0) {
            startButton.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

document.querySelectorAll('.js-player').forEach(initializePlayer);
