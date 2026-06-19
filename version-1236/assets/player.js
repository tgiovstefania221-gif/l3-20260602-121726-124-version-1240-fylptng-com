(function () {
    function bindPlayer(wrapper) {
        const video = wrapper.querySelector('video');
        const overlay = wrapper.querySelector('.player-overlay');
        const source = wrapper.getAttribute('data-video-src');
        let hlsInstance = null;
        let ready = false;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            ready = true;
        }

        function showOverlay(show) {
            if (overlay) {
                overlay.classList.toggle('is-hidden', !show);
            }
        }

        function playVideo() {
            attachSource();
            showOverlay(false);
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    showOverlay(true);
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            showOverlay(false);
        });

        video.addEventListener('ended', function () {
            showOverlay(true);
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    document.querySelectorAll('.player').forEach(bindPlayer);
})();
