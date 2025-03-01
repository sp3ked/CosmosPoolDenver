import React, { useEffect, useRef } from 'react';

interface Star {
  angle: number;
  distance: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  rotationSpeed: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  pulseSpeed: number;
  pulseOffset: number;
}

interface ColorScheme {
  stars: string[];
  nebulae: string[];
}

const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Early return if canvas is null
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Early return if context is null
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const stars: Star[] = [];
    const nebulae: Nebula[] = [];
    const maxStars = 300;
    const maxNebulae = 4;
    
    const colors: ColorScheme = {
      stars: ['#ffffff', '#f8f8ff', '#fffafa', '#f0ffff', '#f5f5f5'],
    //   shootingStars: ['#89cff0', '#add8e6', '#87ceeb', '#00bfff', '#ffffff'],
      nebulae: ['#663399', '#9370db', '#8a2be2', '#9932cc', '#ba55d3', '#800080']
    };
    
    function createStar(): Star {
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      
      // Use a more uniform distribution strategy
      // Divide canvas into a grid and place stars more evenly
      
      // Get a random position across the entire canvas
      let x = Math.random() * canvasWidth;
      let y = Math.random() * canvasHeight;
      
      // Calculate angle and distance from center for rotation
      const angle = Math.atan2(y - centerY, x - centerX);
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      
      return {
        angle: angle,
        distance: distance,
        x: x,
        y: y,
        size: Math.random() * 2.5, // Slightly smaller stars
        color: colors.stars[Math.floor(Math.random() * colors.stars.length)],
        opacity: 0.15 + Math.random() * 0.2, // Even lower opacity range (0.15-0.35)
        rotationSpeed: 0.0001 + Math.random() * 0.0002 // Slower rotation
      };
    }
    
    function createNebula(): Nebula {
      const colorIndex = Math.floor(Math.random() * colors.nebulae.length);
      return {
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        radius: 100 + Math.random() * 200,
        color: colors.nebulae[colorIndex],
        opacity: 0.05 + Math.random() * 0.1,
        pulseSpeed: 0.0005 + Math.random() * 0.001,
        pulseOffset: Math.random() * Math.PI * 2
      };
    }
    
    // Create stars with better distribution
    const gridSize = 20; // Size of each grid cell
    const gridCols = Math.ceil(canvasWidth / gridSize);
    const gridRows = Math.ceil(canvasHeight / gridSize);
    
    // Add some stars in a grid pattern for more even distribution
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        // Only place a star in some cells (for randomness)
        if (Math.random() < 0.3) {
          // Get position within this grid cell plus some random offset
          const x = col * gridSize + Math.random() * gridSize;
          const y = row * gridSize + Math.random() * gridSize;
          
          // Calculate distance and angle from center
          const centerX = canvasWidth / 2;
          const centerY = canvasHeight / 2;
          const angle = Math.atan2(y - centerY, x - centerX);
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          
          stars.push({
            angle: angle,
            distance: distance,
            x: x,
            y: y,
            size: Math.random() * 2.5, // Smaller stars
            color: colors.stars[Math.floor(Math.random() * colors.stars.length)],
            opacity: 0.15 + Math.random() * 0.2, // Even lower opacity
            rotationSpeed: 0.0001 + Math.random() * 0.0002 // Slower rotation
          });
        }
      }
    }
    
    // Add remaining stars randomly to reach maxStars
    while (stars.length < maxStars) {
      stars.push(createStar());
    }
    
    for (let i = 0; i < maxNebulae; i++) {
      nebulae.push(createNebula());
    }
    
    function drawNebulae(): void {
      if (!ctx) return;
      for (let i = 0; i < nebulae.length; i++) {
        const nebula = nebulae[i];
        const currentOpacity = nebula.opacity + Math.sin(Date.now() * nebula.pulseSpeed + nebula.pulseOffset) * 0.02;
        
        const gradient = ctx.createRadialGradient(
          nebula.x, nebula.y, 0,
          nebula.x, nebula.y, nebula.radius
        );
        
        gradient.addColorStop(0, `rgba(${hexToRgb(nebula.color)}, ${currentOpacity})`);
        gradient.addColorStop(1, 'rgba(10, 10, 32, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    function hexToRgb(hex: string): string {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '255, 255, 255';
    }
    
    function drawStars(): void {
      if (!ctx) return;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        // Update star position for rotation
        star.angle += star.rotationSpeed;
        star.x = centerX + Math.cos(star.angle) * star.distance;
        star.y = centerY + Math.sin(star.angle) * star.distance;
        
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity;
        
        if (star.size > 1.8) {
          // Draw a 4-point star for larger stars
          const spikes = 4;
          const outerRadius = star.size;
          const innerRadius = star.size / 2;
          
          ctx.beginPath();
          let rot = Math.PI / 2 * 3;
          let x = star.x;
          let y = star.y;
          let step = Math.PI / spikes;
          
          for (let i = 0; i < spikes; i++) {
            x = star.x + Math.cos(rot) * outerRadius;
            y = star.y + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            
            x = star.x + Math.cos(rot) * innerRadius;
            y = star.y + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
          }
          
          ctx.closePath();
          ctx.fill();
        } else {
          // Simple circle for smaller stars
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
    
    function draw(): void {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      // Space background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, '#050510'); // Darker background
      gradient.addColorStop(1, '#10102a'); // Darker background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      drawNebulae();
      drawStars();
      
      requestAnimationFrame(draw);
    }
    
    const resizeHandler = (): void => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Recalculate star positions for new canvas size
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.x = centerX + Math.cos(star.angle) * star.distance;
        star.y = centerY + Math.sin(star.angle) * star.distance;
      }
    };
    
    window.addEventListener('resize', resizeHandler);
    draw();
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-gray-900">
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full"
      />
      <div className="relative z-10 w-full h-full">
        {/* Your content goes here */}
      </div>
    </div>
  );
};

export default SpaceBackground;