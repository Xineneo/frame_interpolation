// app.js
const { useState, useRef, useEffect } = React;

const detectKeyPoints = (img, gridSize = 5) => {
    const points = [];
    points.push({ x: 0, y: 0 });
    points.push({ x: 1, y: 0 });
    points.push({ x: 1, y: 1 });
    points.push({ x: 0, y: 1 });
    
    for (let i = 1; i < gridSize; i++) {
        for (let j = 1; j < gridSize; j++) {
            points.push({ x: i / gridSize, y: j / gridSize });
        }
    }
    
    for (let i = 1; i < gridSize; i++) {
        points.push({ x: i / gridSize, y: 0 });
        points.push({ x: i / gridSize, y: 1 });
        points.push({ x: 0, y: i / gridSize });
        points.push({ x: 1, y: i / gridSize });
    }
    
    return points;
};

const inCircumcircle = (point, triangle) => {
    const [ax, ay] = triangle[0];
    const [bx, by] = triangle[1];
    const [cx, cy] = triangle[2];
    const [dx, dy] = point;
    
    const ax_dx = ax - dx;
    const ay_dy = ay - dy;
    const bx_dx = bx - dx;
    const by_dy = by - dy;
    const cx_dx = cx - dx;
    const cy_dy = cy - dy;
    
    const det = (ax_dx * ax_dx + ay_dy * ay_dy) * (bx_dx * cy_dy - cx_dx * by_dy) -
                (bx_dx * bx_dx + by_dy * by_dy) * (ax_dx * cy_dy - cx_dx * ay_dy) +
                (cx_dx * cx_dx + cy_dy * cy_dy) * (ax_dx * by_dy - bx_dx * ay_dy);
    
    return det > 0;
};

const hasEdge = (triangle, edge) => {
    const edges = [
        [triangle[0], triangle[1]],
        [triangle[1], triangle[2]],
        [triangle[2], triangle[0]]
    ];
    
    return edges.some(e => 
        (e[0] === edge[0] && e[1] === edge[1]) || 
        (e[0] === edge[1] && e[1] === edge[0])
    );
};

const delaunayTriangulate = (points) => {
    if (points.length < 3) return [];
    
    const minX = Math.min(...points.map(p => p[0]));
    const minY = Math.min(...points.map(p => p[1]));
    const maxX = Math.max(...points.map(p => p[0]));
    const maxY = Math.max(...points.map(p => p[1]));
    
    const dx = maxX - minX;
    const dy = maxY - minY;
    const deltaMax = Math.max(dx, dy) * 2;
    const midx = (minX + maxX) / 2;
    const midy = (minY + maxY) / 2;
    
    const p1 = [midx - 20 * deltaMax, midy - deltaMax];
    const p2 = [midx, midy + 20 * deltaMax];
    const p3 = [midx + 20 * deltaMax, midy - deltaMax];
    
    const triangles = [[p1, p2, p3]];
    
    for (const point of points) {
        const badTriangles = [];
        
        for (const triangle of triangles) {
            if (inCircumcircle(point, triangle)) {
                badTriangles.push(triangle);
            }
        }
        
        const polygon = [];
        
        for (const triangle of badTriangles) {
            for (let i = 0; i < 3; i++) {
                const edge = [triangle[i], triangle[(i + 1) % 3]];
                
                let isShared = false;
                for (const other of badTriangles) {
                    if (other === triangle) continue;
                    if (hasEdge(other, edge)) {
                        isShared = true;
                        break;
                    }
                }
                
                if (!isShared) {
                    polygon.push(edge);
                }
            }
        }
        
        for (const bad of badTriangles) {
            const index = triangles.indexOf(bad);
            if (index > -1) triangles.splice(index, 1);
        }
        
        for (const edge of polygon) {
            triangles.push([edge[0], edge[1], point]);
        }
    }
    
    const finalTriangles = triangles.filter(triangle => {
        return !triangle.some(vertex => {
            const [vx, vy] = vertex;
            return (vx === p1[0] && vy === p1[1]) ||
                   (vx === p2[0] && vy === p2[1]) ||
                   (vx === p3[0] && vy === p3[1]);
        });
    });
    
    const indices = [];
    for (const triangle of finalTriangles) {
        for (const vertex of triangle) {
            const index = points.findIndex(p => 
                Math.abs(p[0] - vertex[0]) < 0.001 && 
                Math.abs(p[1] - vertex[1]) < 0.001
            );
            if (index !== -1) indices.push(index);
        }
    }
    
    return indices;
};

const Upload = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
    </svg>
);

const Play = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
);

const Pause = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
    </svg>
);

const Download = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
    </svg>
);

const Plus = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);

const Trash2 = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
);

const Moon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
);

const Sun = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
);

const FrameInterpolator = () => {
  const [keyframes, setKeyframes] = useState([]);
  const [framesBetween, setFramesBetween] = useState(10);
  const [fps, setFps] = useState(24);
  const [easingType, setEasingType] = useState('linear');
  const [interpolatedFrames, setInterpolatedFrames] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState('webm');
  const [interpolationType, setInterpolationType] = useState('morphing');
  const [gridSize, setGridSize] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputWidth, setOutputWidth] = useState(1920);
  const [outputHeight, setOutputHeight] = useState(1080);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const recorderRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Ошибка загрузки: ${file.name}`));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error(`Ошибка чтения: ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (files) => {
    const fileArray = Array.from(files);
    try {
      const images = await Promise.all(fileArray.map(loadImage));
      const newKeyframes = images.map((img, idx) => ({
        id: Date.now() + idx,
        image: img,
        frameNumber: keyframes.length > 0 ? keyframes[keyframes.length - 1].frameNumber + framesBetween + 1 : 0
      }));
      setKeyframes(prev => [...prev, ...newKeyframes]);
      
      if (keyframes.length === 0 && images.length > 0) {
        setOutputWidth(images[0].width);
        setOutputHeight(images[0].height);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const removeKeyframe = (id) => {
    setKeyframes(prev => prev.filter(kf => kf.id !== id));
  };

  const easingFunctions = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
  };

  const resizeImageToCanvas = (img, width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    const scaleX = width / img.width;
    const scaleY = height / img.height;
    const scale = Math.max(scaleX, scaleY);
    
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (width - scaledWidth) / 2;
    const y = (height - scaledHeight) / 2;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    
    return canvas;
  };

  const interpolatePixelsAdvanced = (img1, img2, ratio, easing) => {
    const canvas1 = resizeImageToCanvas(img1, outputWidth, outputHeight);
    const canvas2 = resizeImageToCanvas(img2, outputWidth, outputHeight);

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d', { alpha: false });

    const easedRatio = easingFunctions[easing](ratio);

    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    
    const imgData1 = ctx1.getImageData(0, 0, outputWidth, outputHeight);
    const imgData2 = ctx2.getImageData(0, 0, outputWidth, outputHeight);
    
    const data1 = imgData1.data;
    const data2 = imgData2.data;
    const interpolatedData = new Uint8ClampedArray(data1.length);

    for (let i = 0; i < data1.length; i += 4) {
      interpolatedData[i] = Math.round(data1[i] + (data2[i] - data1[i]) * easedRatio);
      interpolatedData[i + 1] = Math.round(data1[i + 1] + (data2[i + 1] - data1[i + 1]) * easedRatio);
      interpolatedData[i + 2] = Math.round(data1[i + 2] + (data2[i + 2] - data1[i + 2]) * easedRatio);
      interpolatedData[i + 3] = 255;
    }

    const imgData = new ImageData(interpolatedData, outputWidth, outputHeight);
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  };

  const catmullRomSpline = (p0, p1, p2, p3, t) => {
    const t2 = t * t;
    const t3 = t2 * t;
    
    return 0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
  };

  const computeOpticalFlow = (img1Data, img2Data, width, height, blockSize = 8) => {
    const flow = new Float32Array(width * height * 2);
    
    for (let y = blockSize; y < height - blockSize; y += blockSize) {
      for (let x = blockSize; x < width - blockSize; x += blockSize) {
        let bestDx = 0;
        let bestDy = 0;
        let minError = Infinity;
        
        const searchRange = 12;
        
        for (let dy = -searchRange; dy <= searchRange; dy += 2) {
          for (let dx = -searchRange; dx <= searchRange; dx += 2) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx < blockSize || nx >= width - blockSize || 
                ny < blockSize || ny >= height - blockSize) continue;
            
            let error = 0;
            for (let by = 0; by < blockSize; by++) {
              for (let bx = 0; bx < blockSize; bx++) {
                const idx1 = ((y + by) * width + (x + bx)) * 4;
                const idx2 = ((ny + by) * width + (nx + bx)) * 4;
                
                const dr = img1Data[idx1] - img2Data[idx2];
                const dg = img1Data[idx1 + 1] - img2Data[idx2 + 1];
                const db = img1Data[idx1 + 2] - img2Data[idx2 + 2];
                
                error += Math.abs(dr) + Math.abs(dg) + Math.abs(db);
              }
            }
            
            if (error < minError) {
              minError = error;
              bestDx = dx;
              bestDy = dy;
            }
          }
        }
        
        for (let by = 0; by < blockSize; by++) {
          for (let bx = 0; bx < blockSize; bx++) {
            const idx = ((y + by) * width + (x + bx)) * 2;
            flow[idx] = bestDx;
            flow[idx + 1] = bestDy;
          }
        }
      }
    }
    
    const smoothedFlow = new Float32Array(width * height * 2);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sumX = 0, sumY = 0, count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 2;
            sumX += flow[idx];
            sumY += flow[idx + 1];
            count++;
          }
        }
        const idx = (y * width + x) * 2;
        smoothedFlow[idx] = sumX / count;
        smoothedFlow[idx + 1] = sumY / count;
      }
    }
    
    return smoothedFlow;
  };

  const interpolateOpticalFlow = (img1, img2, ratio) => {
    const canvas1 = resizeImageToCanvas(img1, outputWidth, outputHeight);
    const canvas2 = resizeImageToCanvas(img2, outputWidth, outputHeight);

    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    
    const imgData1 = ctx1.getImageData(0, 0, outputWidth, outputHeight);
    const imgData2 = ctx2.getImageData(0, 0, outputWidth, outputHeight);
    
    const flow = computeOpticalFlow(imgData1.data, imgData2.data, outputWidth, outputHeight);
    
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    const outputData = ctx.createImageData(outputWidth, outputHeight);
    const data1 = imgData1.data;
    const data2 = imgData2.data;
    const output = outputData.data;
    
    for (let y = 0; y < outputHeight; y++) {
      for (let x = 0; x < outputWidth; x++) {
        const flowIdx = (y * outputWidth + x) * 2;
        const dx = flow[flowIdx];
        const dy = flow[flowIdx + 1];
        
        const srcX1 = x;
        const srcY1 = y;
        const srcX2 = Math.max(0, Math.min(outputWidth - 1, x + dx));
        const srcY2 = Math.max(0, Math.min(outputHeight - 1, y + dy));
        
        const interpX = srcX1 + (srcX2 - srcX1) * ratio;
        const interpY = srcY1 + (srcY2 - srcY1) * ratio;
        
        const x0 = Math.floor(interpX);
        const y0 = Math.floor(interpY);
        const x1 = Math.min(outputWidth - 1, x0 + 1);
        const y1 = Math.min(outputHeight - 1, y0 + 1);
        
        const fx = interpX - x0;
        const fy = interpY - y0;
        
        const idx = (y * outputWidth + x) * 4;
        
        for (let c = 0; c < 3; c++) {
          const idx00 = (y0 * outputWidth + x0) * 4 + c;
          const idx10 = (y0 * outputWidth + x1) * 4 + c;
          const idx01 = (y1 * outputWidth + x0) * 4 + c;
          const idx11 = (y1 * outputWidth + x1) * 4 + c;
          
          const val1_00 = data1[idx00];
          const val1_10 = data1[idx10];
          const val1_01 = data1[idx01];
          const val1_11 = data1[idx11];
          
          const val2_00 = data2[idx00];
          const val2_10 = data2[idx10];
          const val2_01 = data2[idx01];
          const val2_11 = data2[idx11];
          
          const interp1_top = val1_00 * (1 - fx) + val1_10 * fx;
          const interp1_bot = val1_01 * (1 - fx) + val1_11 * fx;
          const interp1 = interp1_top * (1 - fy) + interp1_bot * fy;
          
          const interp2_top = val2_00 * (1 - fx) + val2_10 * fx;
          const interp2_bot = val2_01 * (1 - fx) + val2_11 * fx;
          const interp2 = interp2_top * (1 - fy) + interp2_bot * fy;
          
          output[idx + c] = Math.round(interp1 * (1 - ratio) + interp2 * ratio);
        }
        
        output[idx + 3] = 255;
      }
    }
    
    ctx.putImageData(outputData, 0, 0);
    return canvas;
  };

  const interpolateSpline = (img0, img1, img2, img3, ratio) => {
    const canvas0 = img0 ? resizeImageToCanvas(img0, outputWidth, outputHeight) : null;
    const canvas1 = resizeImageToCanvas(img1, outputWidth, outputHeight);
    const canvas2 = resizeImageToCanvas(img2, outputWidth, outputHeight);
    const canvas3 = img3 ? resizeImageToCanvas(img3, outputWidth, outputHeight) : null;

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d', { alpha: false });

    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    const ctx0 = canvas0 ? canvas0.getContext('2d') : null;
    const ctx3 = canvas3 ? canvas3.getContext('2d') : null;
    
    const imgData1 = ctx1.getImageData(0, 0, outputWidth, outputHeight);
    const imgData2 = ctx2.getImageData(0, 0, outputWidth, outputHeight);
    const imgData0 = ctx0 ? ctx0.getImageData(0, 0, outputWidth, outputHeight) : null;
    const imgData3 = ctx3 ? ctx3.getImageData(0, 0, outputWidth, outputHeight) : null;
    
    const data0 = imgData0 ? imgData0.data : imgData1.data;
    const data1 = imgData1.data;
    const data2 = imgData2.data;
    const data3 = imgData3 ? imgData3.data : imgData2.data;
    
    const interpolatedData = new Uint8ClampedArray(data1.length);

    for (let i = 0; i < data1.length; i += 4) {
      interpolatedData[i] = Math.max(0, Math.min(255, Math.round(
        catmullRomSpline(data0[i], data1[i], data2[i], data3[i], ratio)
      )));
      interpolatedData[i + 1] = Math.max(0, Math.min(255, Math.round(
        catmullRomSpline(data0[i + 1], data1[i + 1], data2[i + 1], data3[i + 1], ratio)
      )));
      interpolatedData[i + 2] = Math.max(0, Math.min(255, Math.round(
        catmullRomSpline(data0[i + 2], data1[i + 2], data2[i + 2], data3[i + 2], ratio)
      )));
      interpolatedData[i + 3] = 255;
    }

    const imgData = new ImageData(interpolatedData, outputWidth, outputHeight);
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  };

  const interpolateMorphing = (img1, img2, ratio, gridSize) => {
    try {
      const points1 = detectKeyPoints(img1, gridSize);
      const points2 = detectKeyPoints(img2, gridSize);

      if (points1.length < 3) {
        return interpolatePixelsAdvanced(img1, img2, ratio, easingType);
      }

      const triangulatedPoints = points1.map(p => [p.x * outputWidth, p.y * outputHeight]);
      const triangles = delaunayTriangulate(triangulatedPoints);
      
      if (!triangles.length) {
        return interpolatePixelsAdvanced(img1, img2, ratio, easingType);
      }

      const geometry = new THREE.BufferGeometry();

      const positions1 = new Float32Array(points1.length * 3);
      const positions2 = new Float32Array(points1.length * 3);
      const uvs = new Float32Array(points1.length * 2);

      for (let i = 0; i < points1.length; i++) {
        positions1[i * 3] = (points1[i].x * 2 - 1);
        positions1[i * 3 + 1] = -(points1[i].y * 2 - 1);
        positions1[i * 3 + 2] = 0;

        positions2[i * 3] = (points2[i].x * 2 - 1);
        positions2[i * 3 + 1] = -(points2[i].y * 2 - 1);
        positions2[i * 3 + 2] = 0;

        uvs[i * 2] = points1[i].x;
        uvs[i * 2 + 1] = points1[i].y;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions1, 3));
      geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(triangles), 1));
      geometry.morphAttributes.position = [new THREE.BufferAttribute(positions2, 3)];

      const canvas1 = resizeImageToCanvas(img1, outputWidth, outputHeight);
      const canvas2 = resizeImageToCanvas(img2, outputWidth, outputHeight);
      
      const texture1 = new THREE.CanvasTexture(canvas1);
      texture1.minFilter = THREE.LinearFilter;
      texture1.magFilter = THREE.LinearFilter;
      
      const texture2 = new THREE.CanvasTexture(canvas2);
      texture2.minFilter = THREE.LinearFilter;
      texture2.magFilter = THREE.LinearFilter;

      const material = new THREE.ShaderMaterial({
        uniforms: {
          texture1: { value: texture1 },
          texture2: { value: texture2 },
          ratio: { value: ratio },
          morphInfluence: { value: ratio }
        },
        vertexShader: `
          uniform float morphInfluence;
          attribute vec3 morphTarget0;
          varying vec2 vUv;
          
          void main() {
            vec3 morphed = mix(position, morphTarget0, morphInfluence);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(morphed, 1.0);
            vUv = uv;
          }
        `,
        fragmentShader: `
          uniform sampler2D texture1;
          uniform sampler2D texture2;
          uniform float ratio;
          varying vec2 vUv;
          
          void main() {
            vec4 color1 = texture2D(texture1, vUv);
            vec4 color2 = texture2D(texture2, vUv);
            gl_FragColor = mix(color1, color2, ratio);
          }
        `
      });

      const mesh = new THREE.Mesh(geometry, material);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      scene.add(mesh);

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: false,
        preserveDrawingBuffer: true
      });
      renderer.setSize(outputWidth, outputHeight);
      renderer.setClearColor(0x000000, 1);

      renderer.render(scene, camera);

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = outputWidth;
      outputCanvas.height = outputHeight;
      const ctx = outputCanvas.getContext('2d', { alpha: false });
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      ctx.drawImage(renderer.domElement, 0, 0);

      texture1.dispose();
      texture2.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      scene.remove(mesh);

      return outputCanvas;
    } catch (err) {
      console.error('Ошибка морфинга:', err);
      return interpolatePixelsAdvanced(img1, img2, ratio, easingType);
    }
  };

  const generateFrames = async () => {
    if (keyframes.length < 2) {
      alert('Загрузите минимум 2 ключевых кадра');
      return;
    }

    setIsGenerating(true);
    setInterpolatedFrames([]);
    setProgress(0);
    setProgressText('Подготовка...');
    
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const allFrames = [];
      const totalInterpFrames = (keyframes.length - 1) * framesBetween;
      let processedFrames = 0;
      
      for (let i = 0; i < keyframes.length - 1; i++) {
        const startFrame = keyframes[i];
        const endFrame = keyframes[i + 1];
        
        const startCanvas = resizeImageToCanvas(startFrame.image, outputWidth, outputHeight);
        allFrames.push({ canvas: startCanvas, isKeyframe: true });
        
        setProgressText(`Обработка пары ${i + 1}/${keyframes.length - 1}`);
        
        for (let j = 1; j <= framesBetween; j++) {
          const ratio = j / (framesBetween + 1);
          
          let canvas;
          if (interpolationType === 'morphing') {
            canvas = interpolateMorphing(startFrame.image, endFrame.image, ratio, gridSize);
          } else if (interpolationType === 'spline') {
            const prevFrame = i > 0 ? keyframes[i - 1].image : null;
            const nextFrame = i < keyframes.length - 2 ? keyframes[i + 2].image : null;
            canvas = interpolateSpline(prevFrame, startFrame.image, endFrame.image, nextFrame, ratio);
          } else if (interpolationType === 'optical') {
            canvas = interpolateOpticalFlow(startFrame.image, endFrame.image, ratio);
          } else {
            canvas = interpolatePixelsAdvanced(startFrame.image, endFrame.image, ratio, easingType);
          }
          
          allFrames.push({ canvas, isKeyframe: false });
          processedFrames++;
          setProgress((processedFrames / totalInterpFrames) * 100);
          
          if (j % 3 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }
      }
      
      const lastFrame = keyframes[keyframes.length - 1];
      const lastCanvas = resizeImageToCanvas(lastFrame.image, outputWidth, outputHeight);
      allFrames.push({ canvas: lastCanvas, isKeyframe: true });
      
      setInterpolatedFrames(allFrames);
      setCurrentFrame(0);
      setProgress(100);
      setProgressText('Готово!');
    } catch (err) {
      console.error('Ошибка генерации:', err);
      alert('Ошибка генерации кадров: ' + err.message);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setProgressText('');
      }, 1000);
    }
  };

  const drawFrame = (frameIndex, showOverlay = true) => {
    if (!canvasRef.current || !interpolatedFrames[frameIndex]) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const frame = interpolatedFrames[frameIndex];
    
    if (canvas.width !== frame.canvas.width || canvas.height !== frame.canvas.height) {
      canvas.width = frame.canvas.width;
      canvas.height = frame.canvas.height;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frame.canvas, 0, 0);
    
    if (showOverlay) {
      ctx.fillStyle = frame.isKeyframe ? '#ef4444' : '#8b5cf6';
      ctx.font = 'bold 24px Arial';
      ctx.strokeStyle = darkMode ? '#1f2937' : 'white';
      ctx.lineWidth = 4;
      const text = `Кадр ${frameIndex + 1}/${interpolatedFrames.length}${frame.isKeyframe ? ' [KEY]' : ''}`;
      ctx.strokeText(text, 15, 40);
      ctx.fillText(text, 15, 40);
    }
  };

  useEffect(() => {
    if (interpolatedFrames.length > 0 && !isDownloadingVideo) {
      drawFrame(currentFrame, true);
    }
  }, [currentFrame, interpolatedFrames, isDownloadingVideo, darkMode]);

  useEffect(() => {
    if (isPlaying && interpolatedFrames.length > 0) {
      const frameDuration = 1000 / fps;
      let frame = currentFrame;
      
      const animate = (timestamp) => {
        if (!isPlaying) return;
        
        if (!lastFrameTimeRef.current) {
          lastFrameTimeRef.current = timestamp;
        }
        
        const elapsed = timestamp - lastFrameTimeRef.current;
        
        if (elapsed >= frameDuration) {
          drawFrame(frame, !isDownloadingVideo);
          frame = (frame + 1) % interpolatedFrames.length;
          setCurrentFrame(frame);
          lastFrameTimeRef.current = timestamp;
          
          if (frame === 0) {
            setIsPlaying(false);
            lastFrameTimeRef.current = 0;
            if (isDownloadingVideo && recorderRef.current) {
              recorderRef.current.stop();
              setIsDownloadingVideo(false);
              recorderRef.current = null;
            }
            return;
          }
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      lastFrameTimeRef.current = 0;
    }
  }, [isPlaying, interpolatedFrames, fps, isDownloadingVideo]);

  const playAnimation = () => {
    if (interpolatedFrames.length === 0 || isPlaying || isDownloadingVideo) return;
    setIsPlaying(true);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    lastFrameTimeRef.current = 0;
  };

  const downloadFrames = async () => {
    if (interpolatedFrames.length === 0) {
      alert('Нет кадров для скачивания');
      return;
    }

    if (downloadFormat === 'zip-png' || downloadFormat === 'zip-jpg') {
      const zip = new JSZip();
      const format = downloadFormat === 'zip-png' ? 'image/png' : 'image/jpeg';
      const ext = downloadFormat === 'zip-png' ? 'png' : 'jpg';
      
      const blobsPromises = interpolatedFrames.map((frame, index) =>
        new Promise((resolve) => {
          frame.canvas.toBlob((blob) => {
            resolve({ index, blob });
          }, format, 0.95);
        })
      );

      const blobs = await Promise.all(blobsPromises);
      blobs.forEach(({ index, blob }) => {
        zip.file(`frame_${String(index).padStart(4, '0')}.${ext}`, blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'frames.zip';
      a.click();
      URL.revokeObjectURL(url);
    } else if (downloadFormat === 'png' || downloadFormat === 'jpg') {
      const format = downloadFormat === 'png' ? 'image/png' : 'image/jpeg';
      const ext = downloadFormat;
      
      interpolatedFrames.forEach((frame, index) => {
        frame.canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `frame_${String(index).padStart(4, '0')}.${ext}`;
          a.click();
          URL.revokeObjectURL(url);
        }, format, 0.95);
      });
    }
  };

  const downloadVideo = async () => {
    if (interpolatedFrames.length === 0 || isPlaying || isGenerating || isDownloadingVideo) {
      alert('Нет кадров или процесс занят');
      return;
    }

    if (downloadFormat === 'gif') {
      setIsDownloadingVideo(true);
      setProgress(0);
      setProgressText('Создание GIF...');

      try {
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: outputWidth,
          height: outputHeight,
          workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
        });

        gif.on('progress', (p) => {
          setProgress(p * 100);
        });

        interpolatedFrames.forEach((frame) => {
          gif.addFrame(frame.canvas, { delay: 1000 / fps });
        });

        gif.on('finished', (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'animation.gif';
          a.click();
          URL.revokeObjectURL(url);
          setIsDownloadingVideo(false);
          setProgress(0);
          setProgressText('');
        });

        gif.render();
      } catch (err) {
        alert('Ошибка создания GIF: ' + err.message);
        setIsDownloadingVideo(false);
        setProgress(0);
        setProgressText('');
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloadingVideo(true);
    setProgress(0);
    setProgressText('Запись видео...');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    drawFrame(0, false);
    await new Promise(resolve => setTimeout(resolve, 100));

    const stream = canvas.captureStream(fps);
    const chunks = [];

    const mimeType = downloadFormat === 'mp4' ? 'video/webm;codecs=h264' : 'video/webm;codecs=vp9';
    recorderRef.current = new MediaRecorder(stream, { mimeType });

    recorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorderRef.current.onstop = async () => {
      const expectedDuration = interpolatedFrames.length * (1000 / fps);
      const blob = new Blob(chunks, { type: 'video/webm' });
      
      let finalBlob = blob;
      if (typeof ysFixWebmDuration !== 'undefined') {
        try {
          finalBlob = await ysFixWebmDuration(blob, expectedDuration, { logger: false });
        } catch (err) {
          console.warn('Не удалось исправить длительность видео:', err);
        }
      }
      
      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFormat === 'mp4' ? 'animation.mp4' : 'animation.webm';
      a.click();
      URL.revokeObjectURL(url);
      setProgress(0);
      setProgressText('');
    };

    recorderRef.current.start();
    setCurrentFrame(0);
    setIsPlaying(true);
  };

  const bgClass = darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50';
  const cardClass = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondaryClass = darkMode ? 'text-gray-300' : 'text-gray-600';
  const inputClass = darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900';
  const hoverClass = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  return (
    <div className={`min-h-screen ${bgClass} p-4 md:p-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold ${textClass} mb-2`}>Интерполятор кадров Pro</h1>
            <p className={textSecondaryClass}>Создавайте плавные переходы с поддержкой MP4, GIF, PNG</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-lg ${cardClass} ${hoverClass} transition`}
            aria-label="Переключить тему"
          >
            {darkMode ? <Sun /> : <Moon />}
          </button>
        </div>
        
        <div className={`${cardClass} rounded-lg p-4 mb-6 border-l-4 ${darkMode ? 'border-purple-500 bg-gradient-to-r from-gray-800 to-gray-800' : 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-3 flex items-center`}>
            <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-purple-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Как использовать
          </h3>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg p-4 mb-4 shadow-sm`}>
            <div className="flex items-start gap-3 mb-2">
              <div className={`${darkMode ? 'bg-purple-600' : 'bg-blue-500'} text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm`}>1</div>
              <div>
                <div className={`font-semibold ${textClass}`}>Загрузите изображения (Drag & Drop или выбор)</div>
                <div className={`text-sm ${textSecondaryClass} mt-1`}>Минимум 2 изображения для создания плавного перехода</div>
              </div>
            </div>
            <div className="flex items-start gap-3 mb-2">
              <div className={`${darkMode ? 'bg-purple-600' : 'bg-blue-500'} text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm`}>2</div>
              <div>
                <div className={`font-semibold ${textClass}`}>Выберите метод интерполяции</div>
                <div className={`text-sm ${textSecondaryClass} mt-1`}>
                  <strong>Линейная</strong> - быстрая. <strong>Морфинг</strong> - плавная деформация. <strong>Сплайн</strong> - максимальная плавность.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 mb-2">
              <div className={`${darkMode ? 'bg-purple-600' : 'bg-blue-500'} text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm`}>3</div>
              <div>
                <div className={`font-semibold ${textClass}`}>Настройте параметры</div>
                <div className={`text-sm ${textSecondaryClass} mt-1`}>FPS, количество кадров, формат экспорта (MP4, GIF, PNG)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={`${darkMode ? 'bg-purple-600' : 'bg-blue-500'} text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm`}>4</div>
              <div>
                <div className={`font-semibold ${textClass}`}>Создайте и скачайте</div>
                <div className={`text-sm ${textSecondaryClass} mt-1`}>Программа создаст плавный переход между изображениями</div>
              </div>
            </div>
          </div>

          <h4 className={`text-md font-semibold ${textClass} mb-3 mt-4`}>📊 Готовые шаблоны настроек:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <button 
              onClick={() => { setFps(24); setFramesBetween(20); }}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} rounded-lg p-3 shadow-sm text-left transition border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="font-semibold text-purple-600 mb-1">🎬 Кинематографичный</div>
              <div className={textSecondaryClass}>24 FPS • 20 кадров</div>
              <div className={`text-xs ${textSecondaryClass} mt-1`}>Эффект как в кино</div>
            </button>
            
            <button 
              onClick={() => { setFps(30); setFramesBetween(30); }}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} rounded-lg p-3 shadow-sm text-left transition border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="font-semibold text-green-600 mb-1">📺 Стандартное видео</div>
              <div className={textSecondaryClass}>30 FPS • 30 кадров</div>
              <div className={`text-xs ${textSecondaryClass} mt-1`}>Универсальный вариант</div>
            </button>
            
            <button 
              onClick={() => { setFps(60); setFramesBetween(50); }}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} rounded-lg p-3 shadow-sm text-left transition border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="font-semibold text-blue-600 mb-1">⚡ Плавный морфинг</div>
              <div className={textSecondaryClass}>60 FPS • 50 кадров</div>
              <div className={`text-xs ${textSecondaryClass} mt-1`}>Максимальная плавность</div>
            </button>
            
            <button 
              onClick={() => { setFps(12); setFramesBetween(8); }}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} rounded-lg p-3 shadow-sm text-left transition border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="font-semibold text-orange-600 mb-1">🎨 Художественный</div>
              <div className={textSecondaryClass}>12 FPS • 8 кадров</div>
              <div className={`text-xs ${textSecondaryClass} mt-1`}>Стоп-моушен эффект</div>
            </button>
            
            <button 
              onClick={() => { setFps(30); setFramesBetween(10); }}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} rounded-lg p-3 shadow-sm text-left transition border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="font-semibold text-red-600 mb-1">🚀 Быстрый переход</div>
              <div className={textSecondaryClass}>30 FPS • 10 кадров</div>
              <div className={`text-xs ${textSecondaryClass} mt-1`}>Динамичная смена</div>
            </button>
            
            <button 
              onClick={() => { setFps(24); setFramesBetween(60); }}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} rounded-lg p-3 shadow-sm text-left transition border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="font-semibold text-indigo-600 mb-1">💫 Медленный морфинг</div>
              <div className={textSecondaryClass}>24 FPS • 60 кадров</div>
              <div className={`text-xs ${textSecondaryClass} mt-1`}>Долгий плавный переход</div>
            </button>

            <button 
              onClick={() => { setFps(15); setFramesBetween(5); }}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} rounded-lg p-3 shadow-sm text-left transition border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="font-semibold text-yellow-600 mb-1">🎞️ Винтажный</div>
              <div className={textSecondaryClass}>15 FPS • 5 кадров</div>
              <div className={`text-xs ${textSecondaryClass} mt-1`}>Эффект старого кино</div>
            </button>

            <button 
              onClick={() => { setFps(60); setFramesBetween(15); }}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} rounded-lg p-3 shadow-sm text-left transition border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="font-semibold text-pink-600 mb-1">✨ Слоумо переход</div>
              <div className={textSecondaryClass}>60 FPS • 15 кадров</div>
              <div className={`text-xs ${textSecondaryClass} mt-1`}>Плавно и быстро</div>
            </button>

            <button 
              onClick={() => { setFps(30); setFramesBetween(45); }}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} rounded-lg p-3 shadow-sm text-left transition border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="font-semibold text-teal-600 mb-1">🌊 Сбалансированный</div>
              <div className={textSecondaryClass}>30 FPS • 45 кадров</div>
              <div className={`text-xs ${textSecondaryClass} mt-1`}>Золотая середина</div>
            </button>
          </div>
        </div>
        
        {(isGenerating || isDownloadingVideo) && progress > 0 && (
          <div className={`${cardClass} rounded-lg p-6 mb-6 shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${textClass}`}>{progressText}</span>
              <span className={`text-sm font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{Math.round(progress)}%</span>
            </div>
            <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 overflow-hidden`}>
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 shimmer"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className={`${cardClass} rounded-lg shadow-lg p-4 md:p-6`}>
              <h2 className={`text-lg md:text-xl font-semibold mb-4 ${textClass}`}>Настройки</h2>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition ${
                  isDragging 
                    ? 'drag-over' 
                    : darkMode 
                      ? 'border-gray-600 hover:border-purple-500 bg-gray-700/30' 
                      : 'border-gray-300 hover:border-purple-500 bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <Upload />
                  <div className={`mt-2 text-sm md:text-base ${textClass}`}>
                    {isDragging ? 'Отпустите файлы' : 'Перетащите или нажмите'}
                  </div>
                  <div className={`text-xs ${textSecondaryClass} mt-1`}>PNG, JPG, WEBP</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
              </div>
              
              <div className={`mt-4 space-y-2 max-h-64 overflow-y-auto ${darkMode ? 'scrollbar-dark' : ''}`}>
                {keyframes.map((kf, idx) => (
                  <div key={kf.id} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <img 
                        src={kf.image.src} 
                        alt={`Кадр ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <span className={`text-sm font-medium ${textClass}`}>Кадр {idx + 1}</span>
                    </div>
                    <button
                      onClick={() => removeKeyframe(kf.id)}
                      className="text-red-500 hover:text-red-700 transition p-2 rounded hover:bg-red-100"
                      aria-label="Удалить кадр"
                    >
                      <Trash2 />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Разрешение ({outputWidth}×{outputHeight})
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={outputWidth}
                      onChange={(e) => setOutputWidth(parseInt(e.target.value) || 1920)}
                      className={`p-2 border rounded text-sm ${inputClass}`}
                      placeholder="Ширина"
                    />
                    <input
                      type="number"
                      value={outputHeight}
                      onChange={(e) => setOutputHeight(parseInt(e.target.value) || 1080)}
                      className={`p-2 border rounded text-sm ${inputClass}`}
                      placeholder="Высота"
                    />
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button onClick={() => { setOutputWidth(1920); setOutputHeight(1080); }} className={`text-xs ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textClass} px-2 py-1 rounded`}>1080p</button>
                    <button onClick={() => { setOutputWidth(1280); setOutputHeight(720); }} className={`text-xs ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textClass} px-2 py-1 rounded`}>720p</button>
                    <button onClick={() => { setOutputWidth(3840); setOutputHeight(2160); }} className={`text-xs ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textClass} px-2 py-1 rounded`}>4K</button>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Промежуточных кадров: {framesBetween}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={framesBetween}
                    onChange={(e) => setFramesBetween(parseInt(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    FPS: {fps}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button onClick={() => setFps(24)} className={`text-xs ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textClass} px-2 py-1 rounded`}>24</button>
                    <button onClick={() => setFps(30)} className={`text-xs ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textClass} px-2 py-1 rounded`}>30</button>
                    <button onClick={() => setFps(60)} className={`text-xs ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textClass} px-2 py-1 rounded`}>60</button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Сглаживание:
                  </label>
                  <select
                    value={easingType}
                    onChange={(e) => setEasingType(e.target.value)}
                    className={`w-full p-2 border rounded text-sm ${inputClass}`}
                  >
                    <option value="linear">Линейное</option>
                    <option value="easeInQuad">Ease In Quad</option>
                    <option value="easeOutQuad">Ease Out Quad</option>
                    <option value="easeInOutQuad">Ease In Out Quad</option>
                    <option value="easeInCubic">Ease In Cubic</option>
                    <option value="easeOutCubic">Ease Out Cubic</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Метод интерполяции:
                  </label>
                  <select
                    value={interpolationType}
                    onChange={(e) => setInterpolationType(e.target.value)}
                    className={`w-full p-2 border rounded text-sm ${inputClass}`}
                  >
                    <option value="linear">🔷 Линейная</option>
                    <option value="morphing">🎭 Морфинг</option>
                    <option value="spline">🌊 Сплайн</option>
                    <option value="optical">⚠️ Оптический поток</option>
                  </select>
                  
                  <div className={`mt-3 p-3 rounded-lg text-xs ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-blue-50 border border-blue-200'}`}>
                    {interpolationType === 'linear' && (
                      <div>
                        <div className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-700'} mb-2 flex items-center`}>
                          <span className="mr-2">🔷</span> Линейная интерполяция
                        </div>
                        <div className={textSecondaryClass}>
                          <strong>Как работает:</strong> Простое смешивание пикселей между двумя изображениями по прямой линии.
                        </div>
                        <div className={`${textSecondaryClass} mt-2`}>
                          <strong>Плюсы:</strong> Очень быстрая генерация, предсказуемый результат, работает с любыми изображениями.
                        </div>
                        <div className={`${textSecondaryClass} mt-2`}>
                          <strong>Минусы:</strong> Может выглядеть как "размытие" или "двоение", нет деформации форм.
                        </div>
                        <div className={`${darkMode ? 'text-green-400' : 'text-green-700'} mt-2 font-semibold`}>
                          ✅ Используйте для: абстрактных изображений, текстур, быстрых тестов.
                        </div>
                      </div>
                    )}
                    {interpolationType === 'morphing' && (
                      <div>
                        <div className={`font-bold ${darkMode ? 'text-purple-400' : 'text-purple-700'} mb-2 flex items-center`}>
                          <span className="mr-2">🎭</span> Морфинг (Delaunay)
                        </div>
                        <div className={textSecondaryClass}>
                          <strong>Как работает:</strong> Создаёт сетку контрольных точек и плавно деформирует геометрию изображения, используя триангуляцию Делоне.
                        </div>
                        <div className={`${textSecondaryClass} mt-2`}>
                          <strong>Плюсы:</strong> Реалистичное превращение форм, отлично для лиц и объектов, профессиональный вид.
                        </div>
                        <div className={`${textSecondaryClass} mt-2`}>
                          <strong>Минусы:</strong> Медленнее чем линейная, требует больше памяти, может давать артефакты на сложных сценах.
                        </div>
                        <div className={`${darkMode ? 'text-green-400' : 'text-green-700'} mt-2 font-semibold`}>
                          ✅ Используйте для: портретов, людей, животных, объектов с чёткими формами.
                        </div>
                      </div>
                    )}
                    {interpolationType === 'spline' && (
                      <div>
                        <div className={`font-bold ${darkMode ? 'text-cyan-400' : 'text-cyan-700'} mb-2 flex items-center`}>
                          <span className="mr-2">🌊</span> Сплайн (Catmull-Rom)
                        </div>
                        <div className={textSecondaryClass}>
                          <strong>Как работает:</strong> Использует алгоритм Catmull-Rom для учёта предыдущего и следующего кадра, создавая более плавную траекторию.
                        </div>
                        <div className={`${textSecondaryClass} mt-2`}>
                          <strong>Плюсы:</strong> Максимально плавные переходы в последовательности из 3+ кадров, нет резких скачков.
                        </div>
                        <div className={`${textSecondaryClass} mt-2`}>
                          <strong>Минусы:</strong> Работает лучше с 4+ ключевыми кадрами, немного медленнее линейной.
                        </div>
                        <div className={`${darkMode ? 'text-green-400' : 'text-green-700'} mt-2 font-semibold`}>
                          ✅ Используйте для: длинных последовательностей кадров, анимации камеры, тайм-лапсов.
                        </div>
                      </div>
                    )}
                    {interpolationType === 'optical' && (
                      <div>
                        <div className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-700'} mb-2 flex items-center`}>
                          <span className="mr-2">⚠️</span> Оптический поток (ЭКСПЕРИМЕНТАЛЬНО)
                        </div>
                        <div className={textSecondaryClass}>
                          <strong>Как работает:</strong> Анализирует движение пикселей между кадрами и отслеживает их траектории.
                        </div>
                        <div className={`${textSecondaryClass} mt-2`}>
                          <strong>Плюсы:</strong> Может создавать реалистичное движение для видео с движущимися объектами или камерой.
                        </div>
                        <div className={`${darkMode ? 'text-red-400' : 'text-red-700'} mt-2 font-bold`}>
                          ⚠️ ВНИМАНИЕ:
                        </div>
                        <ul className={`list-disc ml-5 ${textSecondaryClass} mt-1 space-y-1`}>
                          <li>Очень медленная генерация (в 5-10 раз медленнее)</li>
                          <li>Может зависнуть на мобильных устройствах</li>
                          <li>Часто даёт артефакты и искажения</li>
                          <li>Требует много RAM (используйте 720p или ниже)</li>
                          <li>Нестабильные результаты</li>
                        </ul>
                        <div className={`${darkMode ? 'text-yellow-400' : 'text-yellow-700'} mt-2 font-semibold`}>
                          💡 Рекомендация: Для большинства задач используйте "Морфинг" или "Сплайн"
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {interpolationType === 'morphing' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                      Плотность сетки: {gridSize}×{gridSize}
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={gridSize}
                      onChange={(e) => setGridSize(parseInt(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Формат экспорта:
                  </label>
                  <select
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value)}
                    className={`w-full p-2 border rounded text-sm ${inputClass}`}
                  >
                    <optgroup label="Видео">
                      <option value="webm">WebM (VP9)</option>
                      <option value="mp4">MP4 (H264)</option>
                      <option value="gif">GIF анимация</option>
                    </optgroup>
                    <optgroup label="Изображения">
                      <option value="png">PNG последовательность</option>
                      <option value="jpg">JPG последовательность</option>
                      <option value="zip-png">ZIP архив (PNG)</option>
                      <option value="zip-jpg">ZIP архив (JPG)</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              
              <button
                onClick={generateFrames}
                disabled={keyframes.length < 2 || isGenerating}
                className={`w-full mt-6 ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'} text-white py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center text-sm md:text-base font-medium shadow-lg`}
                aria-label="Создать анимацию"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Генерация...
                  </>
                ) : (
                  <>
                    <Plus />
                    <span className="ml-2">Создать анимацию</span>
                  </>
                )}
              </button>
            </div>
            
            {interpolatedFrames.length > 0 && (
              <div className={`${cardClass} rounded-lg shadow-lg p-4 md:p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${textClass}`}>Управление</h3>
                
                <button
                  onClick={isPlaying ? stopAnimation : playAnimation}
                  className={`w-full ${isPlaying ? (darkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-600 hover:bg-orange-700') : (darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700')} text-white py-3 rounded-lg transition mb-3 flex items-center justify-center text-sm md:text-base font-medium shadow-lg`}
                  aria-label={isPlaying ? 'Остановить' : 'Воспроизвести'}
                  disabled={isDownloadingVideo}
                >
                  {isPlaying ? <Pause /> : <Play />}
                  <span className="ml-2">{isPlaying ? 'Пауза' : 'Воспроизвести'}</span>
                </button>
                
                {(downloadFormat === 'png' || downloadFormat === 'jpg' || downloadFormat.startsWith('zip')) ? (
                  <button
                    onClick={downloadFrames}
                    className={`w-full ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-lg transition flex items-center justify-center text-sm md:text-base font-medium shadow-lg`}
                    aria-label="Скачать кадры"
                    disabled={isDownloadingVideo}
                  >
                    <Download />
                    <span className="ml-2">Скачать ({interpolatedFrames.length} кадров)</span>
                  </button>
                ) : (
                  <button
                    onClick={downloadVideo}
                    className={`w-full ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-3 rounded-lg transition flex items-center justify-center text-sm md:text-base font-medium shadow-lg`}
                    aria-label="Скачать видео"
                    disabled={isDownloadingVideo}
                  >
                    {isDownloadingVideo ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Запись...
                      </>
                    ) : (
                      <>
                        <Download />
                        <span className="ml-2">Скачать {downloadFormat.toUpperCase()}</span>
                      </>
                    )}
                  </button>
                )}
                
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Кадр: {currentFrame + 1} / {interpolatedFrames.length}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={interpolatedFrames.length - 1}
                    value={currentFrame}
                    onChange={(e) => {
                      stopAnimation();
                      setCurrentFrame(parseInt(e.target.value));
                    }}
                    className="w-full accent-purple-600"
                  />
                </div>
                
                <div className={`mt-4 p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded text-xs md:text-sm ${textSecondaryClass} space-y-1`}>
                  <p className="flex justify-between">
                    <span>Всего кадров:</span>
                    <span className={`font-semibold ${textClass}`}>{interpolatedFrames.length}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Ключевых:</span>
                    <span className={`font-semibold ${textClass}`}>{keyframes.length}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Интерполированных:</span>
                    <span className={`font-semibold ${textClass}`}>{interpolatedFrames.length - keyframes.length}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Длительность:</span>
                    <span className={`font-semibold ${textClass}`}>{(interpolatedFrames.length / fps).toFixed(2)} сек</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Разрешение:</span>
                    <span className={`font-semibold ${textClass}`}>{outputWidth}×{outputHeight}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-2">
            <div className={`${cardClass} rounded-lg shadow-lg p-4 md:p-6`}>
              <h2 className={`text-lg md:text-xl font-semibold mb-4 ${textClass}`}>Превью анимации</h2>
              <div className={`flex justify-center items-center ${darkMode ? 'bg-black' : 'bg-gray-900'} rounded-lg p-4 min-h-[300px] md:min-h-[500px]`}>
                {interpolatedFrames.length > 0 ? (
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-[700px] rounded shadow-2xl"
                  />
                ) : (
                  <div className="text-center text-gray-400 p-4">
                    <svg className="w-20 h-20 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="mb-2 text-lg">Загрузите ключевые кадры</p>
                    <p className="text-sm">и нажмите "Создать анимацию"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<FrameInterpolator />);
