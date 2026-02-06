export function Controls({ hideDesktopInfo = false }: { hideDesktopInfo?: boolean }) {
  return (
    <>
      <div className="sm:hidden p-4 flex justify-between w-full touch-manipulation">
        <div className="dpad-container">
          <div className="dpad">
            <button className="dpad-btn dpad-up" id="btn_up" aria-label="Move Up">
              <svg viewBox="0 0 24 24">
                <path d="M12 4l-8 8h16z" />
              </svg>
            </button>
            <button className="dpad-btn dpad-left" id="btn_left" aria-label="Move Left">
              <svg viewBox="0 0 24 24">
                <path d="M4 12l8-8v16z" />
              </svg>
            </button>
            <div className="dpad-center"></div>
            <button className="dpad-btn dpad-right" id="btn_right" aria-label="Move Right">
              <svg viewBox="0 0 24 24">
                <path d="M20 12l-8 8V4z" />
              </svg>
            </button>
            <button className="dpad-btn dpad-down" id="btn_down" aria-label="Move Down">
              <svg viewBox="0 0 24 24">
                <path d="M12 20l8-8H4z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="action-buttons">
          <button className="action-btn ice-btn" id="btn_action" aria-label="Create Ice Block">
            ICE
          </button>
          <button className="action-btn restart-btn" id="btn_select" aria-label="Restart Level">
            ↺
          </button>
        </div>
      </div>

      {!hideDesktopInfo && (
        <div className="info-card desktop-only">
          <h3>CONTROLS</h3>
          <div className="controls-grid">
            <div className="control-item">
              <span className="control-key">← →</span>
              <span className="control-desc">Move</span>
            </div>
            <div className="control-item">
              <span className="control-key">↓ SPACE</span>
              <span className="control-desc">Ice Block</span>
            </div>
            <div className="control-item">
              <span className="control-key">ENTER</span>
              <span className="control-desc">Restart</span>
            </div>
            <div className="control-item">
              <span className="control-key">ESC</span>
              <span className="control-desc">Pause</span>
            </div>
          </div>
        </div>
      )}
    </>);
}