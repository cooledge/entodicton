import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

const GRID_SIZE = 10;
const CELL_SIZE = 50;
const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE;
const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE;

const SpriteGrid = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const moveTimeoutRef = useRef(null);

  // Sprite state
  const position = useRef({ x: 5, y: 5 });
  const rotation = useRef(0);        // radians
  const velocity = useRef(0);        // m/s

  const [points, setPoints] = useState([]);
  const [currentPos, setCurrentPos] = useState({ x: 5, y: 5 });

  // Controller states
  const [speed, setSpeed] = useState(5);
  const [moveTime, setMoveTime] = useState(2);     // default 2 seconds
  const [useMoveTime, setUseMoveTime] = useState(true);
  const [rotateAmount, setRotateAmount] = useState(90);
  const [useRadians, setUseRadians] = useState(false);

  // Draw function
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    ctx.strokeStyle = '#ddd';
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
      ctx.stroke();
    }

    // Points
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    points.forEach((p) => {
      const px = p.x * CELL_SIZE;
      const py = p.y * CELL_SIZE;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.fillText(p.label, px, py - 15);
      ctx.fillStyle = '#e74c3c';
    });

    // Sprite
    const sx = position.current.x * CELL_SIZE;
    const sy = position.current.y * CELL_SIZE;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rotation.current);

    ctx.fillStyle = '#3498db';
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(-16, -16);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-16, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.fillRect(10, -4, 8, 8);
    ctx.restore();
  };

  // Animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (velocity.current !== 0) {
        const dx = Math.cos(rotation.current) * velocity.current * dt;
        const dy = Math.sin(rotation.current) * velocity.current * dt;

        position.current.x += dx;
        position.current.y += dy;

        position.current.x = Math.max(0.5, Math.min(GRID_SIZE - 0.5, position.current.x));
        position.current.y = Math.max(0.5, Math.min(GRID_SIZE - 0.5, position.current.y));

        setCurrentPos({
          x: Math.round(position.current.x * 100) / 100,
          y: Math.round(position.current.y * 100) / 100
        });
      }

      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    };
  }, [points]);

  // Clear any existing timeout
  const clearMoveTimeout = () => {
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
      moveTimeoutRef.current = null;
    }
  };

  // Exposed methods (improved with optional time)
  useImperativeHandle(ref, () => ({
    forward: (speedValue = 5, timeSeconds) => {
      clearMoveTimeout();
      velocity.current = Math.abs(speedValue);

      if (timeSeconds !== undefined && timeSeconds > 0) {
        moveTimeoutRef.current = setTimeout(() => {
          velocity.current = 0;
        }, timeSeconds * 1000);
      }
    },

    backward: (speedValue = 5, timeSeconds) => {
      clearMoveTimeout();
      velocity.current = -Math.abs(speedValue);

      if (timeSeconds !== undefined && timeSeconds > 0) {
        moveTimeoutRef.current = setTimeout(() => {
          velocity.current = 0;
        }, timeSeconds * 1000);
      }
    },

    rotate: (radians) => {
      rotation.current += radians;
      rotation.current = ((rotation.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    },

    stop: () => {
      clearMoveTimeout();
      velocity.current = 0;
    },

    addPoint: (label, gridX, gridY) => {
      setPoints(prev => [...prev, { label, x: gridX, y: gridY }]);
    },

    getPosition: () => ({
      x: position.current.x,
      y: position.current.y,
      rotation: rotation.current
    })
  }));

  // Button handlers for UI
  const handleForward = () => {
    if (useMoveTime && moveTime > 0) {
      ref.current?.forward(speed, moveTime);
    } else {
      ref.current?.forward(speed);
    }
  };

  const handleBackward = () => {
    if (useMoveTime && moveTime > 0) {
      ref.current?.backward(speed, moveTime);
    } else {
      ref.current?.backward(speed);
    }
  };

  const handleStop = () => {
    ref.current?.stop();
  };

  const handleRotate = () => {
    let radians = useRadians 
      ? parseFloat(rotateAmount) 
      : (parseFloat(rotateAmount) * Math.PI) / 180;
    
    ref.current?.rotate(radians);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '3px solid #333',
          background: '#f8f9fa',
          display: 'block',
          marginBottom: '15px'
        }}
      />

      {/* Status */}
      <div style={{
        marginBottom: '15px',
        padding: '12px',
        background: '#e8f4fd',
        border: '2px solid #3498db',
        borderRadius: '6px',
        fontSize: '16px'
      }}>
        Current Position: <strong>({currentPos.x}, {currentPos.y})</strong> meters &nbsp;&nbsp;
        | &nbsp;&nbsp; Rotation: <strong>{(rotation.current * 180 / Math.PI).toFixed(0)}°</strong>
      </div>

      {/* Control Panel */}
      <div style={{
        padding: '15px',
        border: '2px solid #444',
        borderRadius: '8px',
        background: '#f0f0f0',
        maxWidth: '560px'
      }}>
        <h3 style={{ marginTop: 0 }}>Sprite Controller</h3>

        <div style={{ marginBottom: '12px' }}>
          <label>Speed (m/s): </label>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value) || 0)}
            step="0.5"
            style={{ width: '80px', marginLeft: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              checked={useMoveTime}
              onChange={(e) => setUseMoveTime(e.target.checked)}
            />
            {' '} Move for limited time (seconds):
          </label>
          <input
            type="number"
            value={moveTime}
            onChange={(e) => setMoveTime(parseFloat(e.target.value) || 0)}
            step="0.5"
            disabled={!useMoveTime}
            style={{ width: '80px', marginLeft: '10px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <button onClick={handleForward} style={btnStyle('#27ae60')}>
            ⬆️ Forward
          </button>
          <button onClick={handleBackward} style={btnStyle('#e67e22')}>
            ⬇️ Backward
          </button>
          <button onClick={handleStop} style={btnStyle('#c0392b')}>
            ⏹ Stop
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Rotate by: </label>
          <input
            type="number"
            value={rotateAmount}
            onChange={(e) => setRotateAmount(parseFloat(e.target.value) || 0)}
            step="15"
            style={{ width: '80px', margin: '0 8px' }}
          />
          <select 
            value={useRadians ? 'rad' : 'deg'} 
            onChange={(e) => setUseRadians(e.target.value === 'rad')}
            style={{ padding: '5px' }}
          >
            <option value="deg">Degrees</option>
            <option value="rad">Radians</option>
          </select>
          <button onClick={handleRotate} style={{ marginLeft: '10px', ...btnStyle('#2980b9') }}>
            Rotate
          </button>
        </div>
      </div>
    </div>
  );
});

const btnStyle = (color) => ({
  padding: '10px 18px',
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: color,
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  minWidth: '120px'
});

export default SpriteGrid;
