import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [trails, setTrails] = useState([]);
  const lastTrailTime = useRef(0);

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ 
        x: e.clientX, 
        y: e.clientY 
      });

      // Add a footprint trail if moved and at least 200ms has elapsed since the last footprint
      const now = Date.now();
      if (now - lastTrailTime.current > 200) {
        const newTrail = {
          id: now + Math.random(),
          x: e.clientX,
          y: e.clientY
        };
        setTrails(prev => [...prev.slice(-8), newTrail]);
        lastTrailTime.current = now;
      }
    };
    
    const handleMouseOver = (e) => {
      if (
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'A' ||
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.classList.contains('cursor-pointer') ||
        e.target.closest('.cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };
    
    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);
    
    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);
  
  return (
    <>
      {/* Trails */}
      {trails.map((trail) => (
        <motion.div
          key={trail.id}
          initial={{ opacity: 0.5, scale: 0.8 }}
          animate={{ opacity: 0, scale: 0.4 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            position: 'fixed',
            left: trail.x - 15,
            top: trail.y - 20,
            pointerEvents: 'none',
            zIndex: 9998,
            width: '30px',
            height: '40px'
          }}
        >
          <svg width="30" height="40" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
            <ellipse 
              cx="20" cy="40" 
              rx="15" ry="18" 
              fill="#52B788" 
              opacity="0.4"
            />
            <circle 
              cx="20" cy="50" 
              r="10" 
              fill="#52B788" 
              opacity="0.4"
            />
          </svg>
        </motion.div>
      ))}

      {/* Main Cursor */}
      <motion.div
        className="custom-cursor pointer-events-none fixed top-0 left-0"
        animate={{
          x: position.x - 20,
          y: position.y - 30,
          scale: isHovering ? 1.3 : 1
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
        style={{
          pointerEvents: 'none',
          zIndex: 9999,
          width: '50px',
          height: '60px'
        }}
      >
        <svg 
          width="50" 
          height="60" 
          viewBox="0 0 50 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main foot */}
          <ellipse 
            cx="20" cy="40" 
            rx="15" ry="18" 
            fill="#2D3436" 
            opacity="0.9"
          />
          
          {/* Heel */}
          <circle 
            cx="20" cy="50" 
            r="10" 
            fill="#2D3436" 
            opacity="0.9"
          />
          
          {/* Toes */}
          <circle cx="12" cy="15" 
            r="4" fill="#2D3436"/>
          <circle cx="20" cy="10" 
            r="4.5" fill="#2D3436"/>
          <circle cx="28" cy="12" 
            r="4" fill="#2D3436"/>
          <circle cx="35" cy="18" 
            r="3.5" fill="#2D3436"/>
          
          {/* CO₂ texts */}
          <text x="13" y="35" 
            fill="white" 
            fontSize="6" 
            fontFamily="Arial"
            fontWeight="bold"
            transform="rotate(-15 13 35)">
            CO₂
          </text>
          <text x="22" y="42" 
            fill="white" 
            fontSize="5"
            fontFamily="Arial"
            fontWeight="bold"
            transform="rotate(10 22 42)">
            CO₂
          </text>
          <text x="12" y="48" 
            fill="white" 
            fontSize="5"
            fontFamily="Arial"
            fontWeight="bold"
            transform="rotate(-5 12 48)">
            CO₂
          </text>
          <text x="20" y="55" 
            fill="white" 
            fontSize="6"
            fontFamily="Arial"
            fontWeight="bold"
            transform="rotate(20 20 55)">
            CO₂
          </text>
        </svg>
      </motion.div>
    </>
  );
};

export default CustomCursor;
