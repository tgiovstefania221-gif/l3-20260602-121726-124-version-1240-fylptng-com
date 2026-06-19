import { H as Hls } from './hls-vendor-dru42stk.js';

function setStatus(shell, text) {
    var status = shell.querySelector('[data-player-status]');
    if (status) {
        status.textContent = text;
    }
}

function initPlayer(shell) {
    var video = shell.querySelector('video');
    var playButton = shell.querySelector('[data-play-button]');
    var source = shell.getAttribute('data-video-url');

    if (!video || !source) {
        setStatus(shell, '未检测到播放源');
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus(shell, '已绑定 HLS 播放源');
    } else if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus(shell, '播放源加载完成');
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                setStatus(shell, '播放源加载失败，请稍后重试');
            }
        });
    } else {
        video.src = source;
        setStatus(shell, '当前浏览器尝试直接播放');
    }

    if (playButton) {
        playButton.addEventListener('click', function () {
            video.play().then(function () {
                shell.classList.add('is-playing');
                playButton.style.display = 'none';
                setStatus(shell, '正在播放');
            }).catch(function () {
                setStatus(shell, '请点击视频控件开始播放');
            });
        });
    }

    video.addEventListener('play', function () {
        if (playButton) {
            playButton.style.display = 'none';
        }
        setStatus(shell, '正在播放');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            setStatus(shell, '已暂停');
        }
    });
}

document.querySelectorAll('[data-video-url]').forEach(initPlayer);
