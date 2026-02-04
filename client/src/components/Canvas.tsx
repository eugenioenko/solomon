export function Canvas() {
  return (
    <>
      <canvas id="canvas" height="480" width="672"></canvas>
      <div id="loader" className="d-none">
        <img src="images/tilemap.png" alt="" />
        <img src="images/ice.png" alt="" />
        <img src="images/jar.png" alt="" />
        <img src="images/fire.png" alt="" />
        <img src="images/dona.png" alt="" />
        <img src="images/intro.png" alt="" />
        <img src="images/metal.png" alt="" />
        <img src="images/teleport.png" alt="" />
        <img src="images/frozen.png" alt="" />
        <audio preload="auto" id="sfx-ice-push" src="sounds/sfx-ice-push.mp3"></audio>
        <audio preload="auto" id="sfx-fire-off" src="sounds/sfx-fire-off.mp3"></audio>
        <audio preload="auto" id="sfx-falling" src="sounds/sfx-falling.mp3"></audio>
        <audio preload="auto" id="sfx-new-ice" src="sounds/sfx-new-ice.mp3"></audio>
        <audio preload="auto" id="sfx-climb" src="sounds/sfx-climb.mp3"></audio>
        <audio preload="auto" id="sfx-ice-collision" src="sounds/sfx-ice-collision.mp3"></audio>
        <audio preload="auto" id="sfx-stage-enter" src="sounds/sfx-stage-enter.mp3"></audio>
        <audio preload="auto" id="sfx-danger" src="sounds/sfx-danger.mp3"></audio>
        <audio preload="auto" id="sfx-ice-remove" src="sounds/sfx-ice-remove.mp3"></audio>
        <audio preload="auto" id="sfx-state-leave" src="sounds/sfx-state-leave.mp3"></audio>
        <audio preload="auto" id="sfx-disabled" src="sounds/sfx-disabled.mp3"></audio>
        <audio preload="auto" id="sfx-fall" src="sounds/sfx-fall.mp3"></audio>
        <audio preload="auto" id="sfx-music-sparks" src="music/sparks.mp3"></audio>
      </div>
    </>
  );
}