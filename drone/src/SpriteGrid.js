import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

const GRID_SIZE = 10;
const CELL_SIZE = 50;
const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE;
const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE;

const colors = [
  "red",
  "green",
  "blue",
  "yellow",
  "cyan",
  "magenta"
];

function toPathColor(index) {
  return colors[index % colors.length]
}
    
const SpriteGrid = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const moveTimeoutRef = useRef(null);

  // Sprite state - now using bottom-left as (0,0), Y increases upward
  const position = useRef({ x: 5, y: 5 });
  const rotation = useRef(0);
  const velocity = useRef(0);

  const [paths, setPaths] = useState([]);
  const [newPathName, setNewPathName] = useState('');
  const [currentPos, setCurrentPos] = useState({ x: 5, y: 5 });

  // Controller states
  const [speed, setSpeed] = useState(5);
  const [moveTime, setMoveTime] = useState(2);
  const [useMoveTime, setUseMoveTime] = useState(true);
  const [rotateAmount, setRotateAmount] = useState(90);
  const [useRadians, setUseRadians] = useState(false);

  // Draw function - with flipped Y coordinate
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    ctx.strokeStyle = '#ddd';
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw all path points
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';

    paths.forEach((path, pathIndex) => {
      path.points.forEach((point, i) => {
        // Convert logical (bottom-left origin) to canvas coordinates (top-left origin)
        const px = point.x * CELL_SIZE;
        const py = CANVAS_HEIGHT - point.y * CELL_SIZE;   // ← FLIP Y here

        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();

        if (i === 0) {
          ctx.fillStyle = '#000';
          ctx.fillStyle = toPathColor(pathIndex)
          // ctx.fillText(path.name, px, py - 18);
          ctx.fillText('start', px, py - 18);
          // ctx.fillStyle = '#e74c3c';
        }
      });
    });

    // Draw sprite
        // Draw sprite - with inverted Y (bottom-left = 0,0)
    const sx = position.current.x * CELL_SIZE;
    const sy = CANVAS_HEIGHT - position.current.y * CELL_SIZE;   // Y flipped for canvas

    ctx.save();
    ctx.translate(sx, sy);

    // Important: Invert rotation when Y-axis is flipped
    ctx.rotate(-rotation.current);   // ← Note the negative sign

    ctx.fillStyle = '#3498db';
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 3;

    // Arrow-shaped sprite pointing "forward"
    ctx.beginPath();
    ctx.moveTo(22, 0);      // nose
    ctx.lineTo(-16, -16);   // left wing
    ctx.lineTo(-10, 0);     // back center
    ctx.lineTo(-16, 16);    // right wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Small white rectangle (like a window or detail)
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
        const dx = Math.cos(-rotation.current) * velocity.current * dt;
        const dy = -Math.sin(-rotation.current) * velocity.current * dt;

        position.current.x += dx;
        position.current.y += dy;

        // Keep sprite inside grid (0.5 to GRID_SIZE - 0.5)
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
  }, [paths]);

  // Exposed API (no change needed - logic stays in bottom-left coordinates)
  useImperativeHandle(ref, () => ({
    forward: (speedValue = 5, timeSeconds) => {
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
      velocity.current = Math.abs(speedValue);
      if (timeSeconds !== undefined && timeSeconds > 0) {
        moveTimeoutRef.current = setTimeout(() => velocity.current = 0, timeSeconds * 1000);
      }
    },

    backward: (speedValue = 5, timeSeconds) => {
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
      velocity.current = -Math.abs(speedValue);
      if (timeSeconds !== undefined && timeSeconds > 0) {
        moveTimeoutRef.current = setTimeout(() => velocity.current = 0, timeSeconds * 1000);
      }
    },

    rotate: (radians) => {
      rotation.current -= radians;
      rotation.current = ((rotation.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    },

    stop: () => {
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
      velocity.current = 0;
    },

    addPath: (name = "Path", points) => {
      if (!points) {
        points = [{ x: position.current.x, y: position.current.y }];
      }
      const newPath = {
        id: Date.now(),
        name: name.trim() || `Path ${paths.length + 1}`,
        points,
      };
      setPaths(prev => [...prev, newPath]);
      return newPath;
    },

    addPointToPath: (pathId) => {
      setPaths(prev =>
        prev.map(path =>
          path.id === pathId
            ? { ...path, points: [...path.points, { x: position.current.x, y: position.current.y }] }
            : path
        )
      );
    },

    getPosition: () => ({
      x: position.current.x,
      y: position.current.y,
      rotation: rotation.current
    })
  }));

  // Rest of your UI handlers remain the same
  const handleAddPath = () => {
    if (!newPathName.trim()) return;
    ref.current?.addPath(newPathName.trim());
    setNewPathName('');
  };

  const removePath = (id) => {
    setPaths(prev => prev.filter(p => p.id !== id));
  };

  const handlePathClick = (path) => {
    if (path.points.length > 0) {
      const firstPoint = path.points[0];
      position.current.x = firstPoint.x;
      position.current.y = firstPoint.y;
      setCurrentPos({ 
        x: Math.round(firstPoint.x * 100) / 100, 
        y: Math.round(firstPoint.y * 100) / 100 
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAddPath();
  };

  const handleForward = () => {
    if (useMoveTime && moveTime > 0) ref.current?.forward(speed, moveTime);
    else ref.current?.forward(speed);
  };

  const handleBackward = () => {
    if (useMoveTime && moveTime > 0) ref.current?.backward(speed, moveTime);
    else ref.current?.backward(speed);
  };

  const handleStop = () => ref.current?.stop();

  const handleRotate = () => {
    let radians = useRadians 
      ? parseFloat(rotateAmount) 
      : (parseFloat(rotateAmount) * Math.PI) / 180;
    ref.current?.rotate(radians);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
      <div>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ border: '3px solid #333', background: '#f8f9fa', display: 'block' }}
        />

        <div style={{
          marginTop: '10px',
          padding: '12px',
          background: '#e8f4fd',
          border: '2px solid #3498db',
          borderRadius: '6px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Position: <span className='position'>({currentPos.x.toFixed(1)}, {currentPos.y.toFixed(1)})</span> m &nbsp;&nbsp;|&nbsp;&nbsp; 
          Rotation: <span className='rotation'>{(rotation.current * 180 / Math.PI).toFixed(0)}</span>°
        </div>
      </div>

      {/* Controls + Paths - unchanged */}
      {/* ... (your entire control panel remains the same) ... */}

      <div style={{ minWidth: '400px' }}>
        <h2>Sprite Controller</h2>

        {/* Movement Controls - same as before */}
        <div style={{ padding: '15px', border: '2px solid #444', borderRadius: '8px', background: '#f0f0f0', marginBottom: '20px' }}>
          {/* ... same movement controls as before ... */}
          <div style={{ marginBottom: '12px' }}>
            Speed (m/s): <input type="number" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value) || 0)} step="0.5" style={{ width: '80px', marginLeft: '8px' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>
              <input type="checkbox" checked={useMoveTime} onChange={(e) => setUseMoveTime(e.target.checked)} /> 
              Move for limited time (sec)
            </label>
            <input type="number" value={moveTime} onChange={(e) => setMoveTime(parseFloat(e.target.value) || 0)} disabled={!useMoveTime} step="0.5" style={{ width: '70px', marginLeft: '10px' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <button onClick={handleForward} style={btnStyle('#27ae60')}>⬆️ Forward</button>
            <button onClick={handleBackward} style={btnStyle('#e67e22')}>⬇️ Backward</button>
            <button onClick={handleStop} style={btnStyle('#c0392b')}>⏹ Stop</button>
          </div>

          <div>
            Rotate by: 
            <input type="number" value={rotateAmount} onChange={(e) => setRotateAmount(parseFloat(e.target.value) || 0)} step="15" style={{ width: '70px', margin: '0 8px' }} />
            <select value={useRadians ? 'rad' : 'deg'} onChange={(e) => setUseRadians(e.target.value === 'rad')} style={{ padding: '5px' }}>
              <option value="deg">Degrees</option>
              <option value="rad">Radians</option>
            </select>
            <button onClick={handleRotate} style={{ marginLeft: '10px', ...btnStyle('#2980b9') }}>Rotate</button>
          </div>
        </div>

        {/* Paths Section - same as before */}
        <div style={{ padding: '15px', border: '2px solid #444', borderRadius: '8px', background: '#f0f0f0' }}>
          <h3 style={{ marginTop: 0 }}>Paths ({paths.length})</h3>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            <input
              type="text"
              value={newPathName}
              onChange={(e) => setNewPathName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Path name (e.g. Route 1)"
              style={{ flex: 1, padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button onClick={handleAddPath} style={btnStyle('#27ae60')}>Add Path</button>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {paths.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>No paths yet. Add one using current position.</p>
            ) : (
              paths.map((path, pathIndex) => (
                <div
                  key={path.id}
                  onClick={() => handlePathClick(path)}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong><span className={`pathName_${pathIndex}`}>{path.name}</span></strong>
                      <div style={{ fontSize: '13px', color: toPathColor(pathIndex) }}>
                        {path.points.length} point{path.points.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removePath(path.id); }}
                      style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '13px' }}
                    >
                      Delete
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                    Points: <span className={`pathPoints_${pathIndex}`}>{path.points.map((point) => `(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`).join(', ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const btnStyle = (color) => ({
  padding: '10px 16px',
  fontSize: '15px',
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: color,
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
});

export default SpriteGrid;
