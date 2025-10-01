'use client';

import { useEffect, useRef } from 'react';

export default function FluidGradient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Dynamically import Three.js only on client-side
    import('three').then((THREE) => {
      if (!containerRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      containerRef.current.appendChild(renderer.domElement);

      // Shader geometry
      const geometry = new THREE.PlaneGeometry(2, 2);

      // Ultra-smooth fluid gradient shader
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          mouse: { value: new THREE.Vector2(0, 0) },
          pulse: { value: 0 },
          pulseCenter: { value: new THREE.Vector2(0.5, 0.5) }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec2 resolution;
          uniform vec2 mouse;
          uniform float pulse;
          uniform vec2 pulseCenter;
          varying vec2 vUv;
          
          void main() {
            vec2 p = (vUv - 0.5) * (resolution.xy / resolution.y);
            p += mouse * 0.05;

            // Interaction pulse effect
            if (pulse > 0.0) {
              float dist = distance(vUv, pulseCenter);
              float ripple = smoothstep(0.0, 1.0, 1.0 - pulse);
              float wave = sin(dist * 20.0 - pulse * 8.0) * 0.05 * ripple;
              p += wave;
            }

            // Smooth color generation using sine waves
            float t = time * 0.1;
            
            float pattern1 = sin(p.x * 2.0 + t) * 0.5 + 0.5;
            float pattern2 = sin(p.y * 2.5 - t * 1.2) * 0.5 + 0.5;
            float pattern3 = sin(dot(p, vec2(1.5, 2.5)) + t * 0.8) * 0.5 + 0.5;
            float pattern4 = sin(length(p) * 3.0 - t * 1.5) * 0.5 + 0.5;
            
            // Soft, calming color palette
            vec3 color1 = vec3(0.05, 0.1, 0.25);  // Deep Sapphire
            vec3 color2 = vec3(0.3, 0.0, 0.3);    // Muted Plum
            vec3 color3 = vec3(0.0, 0.2, 0.3);    // Soft Teal
            vec3 color4 = vec3(0.6, 0.3, 0.2);    // Faded Coral
            
            // Blend colors smoothly
            vec3 finalColor = mix(color1, color2, pattern1);
            finalColor = mix(finalColor, color3, pattern2);
            finalColor = mix(finalColor, color4, pattern3 * pattern4);
            
            // Soft vignette
            float vignette = 1.0 - length(vUv - 0.5) * 0.8;
            finalColor *= vignette;

            gl_FragColor = vec4(finalColor, 1.0);
          }
        `
      });

      const plane = new THREE.Mesh(geometry, material);
      scene.add(plane);

      // Interaction logic
      let targetMouse = new THREE.Vector2(0, 0);
      let isPulsing = false;

      const handleMouseMove = (event: MouseEvent) => {
        targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      };

      const handleInteraction = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        let clientX, clientY;

        if ('touches' in event && event.touches.length > 0) {
          clientX = event.touches[0].clientX;
          clientY = event.touches[0].clientY;
        } else if ('clientX' in event) {
          clientX = event.clientX;
          clientY = event.clientY;
        } else {
          return;
        }

        material.uniforms.pulseCenter.value.x = clientX / window.innerWidth;
        material.uniforms.pulseCenter.value.y = 1.0 - (clientY / window.innerHeight);

        // Start pulse effect
        material.uniforms.pulse.value = 0.01;
        isPulsing = true;

        // Update mouse target
        targetMouse.x = (clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(clientY / window.innerHeight) * 2 + 1;
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mousedown', handleInteraction);
      window.addEventListener('touchstart', handleInteraction as any, { passive: false });
      window.addEventListener('touchmove', handleInteraction as any, { passive: false });

      // Animation loop
      const clock = new THREE.Clock();
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);

        // Smooth mouse interpolation
        material.uniforms.mouse.value.x += (targetMouse.x - material.uniforms.mouse.value.x) * 0.03;
        material.uniforms.mouse.value.y += (targetMouse.y - material.uniforms.mouse.value.y) * 0.03;

        // Update pulse
        if (isPulsing) {
          material.uniforms.pulse.value += 0.05;
          if (material.uniforms.pulse.value >= 2.0) {
            material.uniforms.pulse.value = 0;
            isPulsing = false;
          }
        }

        material.uniforms.time.value = clock.getElapsedTime();
        renderer.render(scene, camera);
      };

      // Window resize
      const onWindowResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', onWindowResize);

      // Start animation
      animate();

      // Cleanup
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction as any);
        window.removeEventListener('touchmove', handleInteraction as any);
        window.removeEventListener('resize', onWindowResize);

        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }

        if (containerRef.current && renderer.domElement) {
          containerRef.current.removeChild(renderer.domElement);
        }

        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    }).catch(error => {
      console.error('Failed to load Three.js:', error);
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10"
      style={{ touchAction: 'none', backgroundColor: '#050508' }}
    />
  );
}

