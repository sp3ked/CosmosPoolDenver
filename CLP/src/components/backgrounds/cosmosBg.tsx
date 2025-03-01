import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface CosmosBackgroundProps {
  width?: number | string;
  height?: number | string;
}

const StandaloneCosmos: React.FC<CosmosBackgroundProps> = ({
  width = '100%',
  height = '100%'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Get actual dimensions
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Initialize scene
    const scene = new THREE.Scene();
    
    // Initialize camera
    const camera = new THREE.PerspectiveCamera(60, containerWidth / containerHeight, 0.1, 1000);
    camera.position.z = 20;
    
    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    // Create galaxy and stars
    const starsGroup = new THREE.Group();
    scene.add(starsGroup);

    // Create stars
    const starCount = 2000;
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    
    // Color palette for stars
    const colorPalette = [
      new THREE.Color(0xffffff), // White
      new THREE.Color(0xadd8e6), // Light blue
      new THREE.Color(0xffb6c1), // Light pink
      new THREE.Color(0xffa500), // Orange
      new THREE.Color(0xff0000)  // Red
    ];
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      // Create a spherical distribution for more realistic galaxy
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      // Flatten the sphere somewhat to make it more galaxy-like
      const flattenFactor = 0.2;
      
      starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * flattenFactor;
      starPositions[i3 + 2] = radius * Math.cos(phi);
      
      // Add some spiral arm effect
      const armOffset = Math.sin(5 * theta) * 10;
      starPositions[i3] += armOffset * Math.cos(theta);
      starPositions[i3 + 2] += armOffset * Math.sin(theta);
      
      // Assign colors
      const colorIndex = Math.floor(Math.random() * colorPalette.length);
      const color = colorPalette[colorIndex];
      starColors[i3] = color.r;
      starColors[i3 + 1] = color.g;
      starColors[i3 + 2] = color.b;
      
      // Vary star sizes
      starSizes[i] = Math.random() * 1.5;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    
    // Create shader material for better-looking stars
    const starsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointTexture: { value: new THREE.TextureLoader().load(generateStarTexture()) }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          
          // Add subtle movement
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float dist = length(position);
          float movement = sin(time * 0.001 + dist * 0.05) * 0.1;
          
          // Apply subtle rotation around galaxy center
          float angle = time * 0.0001 * (30.0 / dist);
          float x = position.x * cos(angle) - position.z * sin(angle);
          float z = position.x * sin(angle) + position.z * cos(angle);
          vec4 newPosition = modelViewMatrix * vec4(x, position.y, z, 1.0);
          
          gl_Position = projectionMatrix * newPosition;
          
          // Twinkle effect
          gl_PointSize = size * (10.0 / -mvPosition.z) * (1.0 + 0.3 * sin(time * 0.01 + dist));
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        
        void main() {
          gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    starsGroup.add(stars);
    
    // Create nebula clouds
    const nebulaCount = 5;
    for (let i = 0; i < nebulaCount; i++) {
      const nebulaSize = 15 + Math.random() * 20;
      const nebulaGeometry = new THREE.SphereGeometry(nebulaSize, 32, 32);
      
      // Create a custom material for the nebula
      const nebulaColor = new THREE.Color();
      nebulaColor.setHSL(Math.random(), 0.8, 0.5);
      
      const nebulaMaterial = new THREE.MeshBasicMaterial({
        color: nebulaColor,
        transparent: true,
        opacity: 0.03 + Math.random() * 0.03,
        wireframe: false
      });
      
      const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
      
      // Position nebula randomly
      const distance = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      nebula.position.x = distance * Math.cos(theta);
      nebula.position.z = distance * Math.sin(theta);
      nebula.position.y = (Math.random() - 0.5) * 15;
      
      starsGroup.add(nebula);
    }
    
    // Create a central bright spot (galactic core)
    const coreGeometry = new THREE.SphereGeometry(2, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffcc,
      transparent: true,
      opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    starsGroup.add(core);
    
    // Add a subtle glow to the core
    const coreLight = new THREE.PointLight(0xffffcc, 2, 30);
    core.add(coreLight);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    // Animation function
    let lastTime = 0;
    const animate = (time: number) => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      const delta = time - lastTime;
      lastTime = time;
      
      // Update star shader time uniform
      if (starsMaterial.uniforms) {
        starsMaterial.uniforms.time.value = time;
      }
      
      // Rotate entire galaxy
      starsGroup.rotation.y += 0.0001 * delta;
      
      // Random subtle movements
      starsGroup.rotation.x = Math.sin(time * 0.00005) * 0.1;
      
      // Render scene
      renderer.render(scene, camera);
    };
    
    // Start animation
    animate(0);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      // Dispose geometries and materials
      starsGeometry.dispose();
      starsMaterial.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, []);

  // Function to generate a star texture
  function generateStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    
    const context = canvas.getContext('2d');
    if (!context) return '';
    
    const gradient = context.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
    );
    
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(240,240,255,0.8)');
    gradient.addColorStop(0.4, 'rgba(220,220,255,0.4)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL();
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: width,
        height: height,
        overflow: 'hidden'
      }}
    />
  );
};

export default StandaloneCosmos;