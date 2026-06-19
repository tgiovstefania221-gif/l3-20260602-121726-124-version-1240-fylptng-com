(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer() {
    const stage = document.querySelector("[data-video-stage]");
    if (!stage) {
      return;
    }
    const video = stage.querySelector("[data-player-video]");
    const cover = stage.querySelector("[data-play-cover]");
    const trigger = stage.querySelector("[data-play-trigger]");
    if (!video) {
      return;
    }
    const stream = video.getAttribute("data-stream");
    let attached = false;

    function attachStream() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      const action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          video.controls = true;
        });
      }
    }

    if (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    }

    if (cover) {
      cover.addEventListener("click", function () {
        start();
      });
    }

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
  }

  ready(setupPlayer);
})();
