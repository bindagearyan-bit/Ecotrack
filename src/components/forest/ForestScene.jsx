import React from 'react';
import { motion } from 'framer-motion';
import { useCarbon } from '../../context/CarbonContext';

const ForestScene = ({ trees }) => {
  const { darkMode } = useCarbon();
  const displayTrees = trees || [];

  // Tree SVG components based on type and size
  const renderTreeSVG = (tree) => {
    // Height mapping based on size
    const heightMap = {
      large: 80,
      medium: 60,
      small: 40
    };
    const height = heightMap[tree.size] || 60;
    const width = height * 0.7;

    // Custom colors depending on tree type
    let foliageColor = '#52B788'; // Default
    if (tree.type === 'pine') foliageColor = '#2D6A4F';
    if (tree.type === 'cherry') foliageColor = '#FF85A2';

    return (
      <motion.g
        key={tree.id}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        style={{ transformOrigin: 'bottom center' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="cursor-pointer group"
      >
        <title>{`Tree #${tree.id}: ${tree.action}`}</title>
        
        {/* Trunk */}
        <rect
          x={-4}
          y={-height * 0.3}
          width={8}
          height={height * 0.3}
          fill="#8B5A2B"
          rx={2}
        />

        {/* Foliage shapes */}
        {tree.type === 'pine' ? (
          // Pine tree: stacked triangles
          <g>
            <polygon points={`0,${-height} ${-width/2},${-height*0.5} ${width/2},${-height*0.5}`} fill={foliageColor} />
            <polygon points={`0,${-height*0.75} ${-width/1.6},${-height*0.3} ${width/1.6},${-height*0.3}`} fill="#1B4332" />
            <polygon points={`0,${-height*0.5} ${-width/1.4},${-height*0.15} ${width/1.4},${-height*0.15}`} fill={foliageColor} />
          </g>
        ) : tree.type === 'cherry' ? (
          // Cherry tree: pink clouds
          <g>
            <circle cx={0} cy={-height * 0.65} r={width * 0.4} fill={foliageColor} />
            <circle cx={-width * 0.25} cy={-height * 0.55} r={width * 0.3} fill="#FFB7C5" />
            <circle cx={width * 0.25} cy={-height * 0.55} r={width * 0.3} fill="#FF85A2" />
            <circle cx={0} cy={-height * 0.45} r={width * 0.3} fill="#FF85A2" />
          </g>
        ) : (
          // Oak tree: round green top
          <g>
            <circle cx={0} cy={-height * 0.65} r={width * 0.45} fill={foliageColor} />
            <circle cx={-width * 0.2} cy={-height * 0.5} r={width * 0.35} fill="#40916C" />
            <circle cx={width * 0.2} cy={-height * 0.5} r={width * 0.35} fill={foliageColor} />
          </g>
        )}
      </motion.g>
    );
  };

  return (
    <div className="w-full relative rounded-2xl overflow-hidden shadow-md h-[400px]">
      <svg
        viewBox="0 0 800 400"
        className="w-full h-full select-none"
        preserveAspectRatio="none"
      >
        {/* Sky Background with Gradient */}
        <defs>
          <linearGradient id="skyLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="100%" stopColor="#B0E0E6" />
          </linearGradient>
          <linearGradient id="skyDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="100%" stopColor="#1C2541" />
          </linearGradient>
          <linearGradient id="groundLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#52B788" />
            <stop offset="100%" stopColor="#2D6A4F" />
          </linearGradient>
          <linearGradient id="groundDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1F3A2B" />
            <stop offset="100%" stopColor="#0F1F0F" />
          </linearGradient>
        </defs>

        <rect
          width="800"
          height="400"
          fill={darkMode ? "url(#skyDark)" : "url(#skyLight)"}
        />

        {/* Sun / Moon and Stars */}
        {darkMode ? (
          // Moon
          <g>
            <circle cx="700" cy="70" r="30" fill="#FFF" filter="drop-shadow(0 0 15px rgba(255,255,255,0.8))" />
            <circle cx="710" cy="65" r="28" fill="#1C2541" />
            {/* Tiny stars */}
            <circle cx="100" cy="50" r="1.5" fill="#FFF" opacity="0.8" />
            <circle cx="250" cy="80" r="1" fill="#FFF" opacity="0.6" />
            <circle cx="340" cy="40" r="2" fill="#FFF" opacity="0.9" />
            <circle cx="480" cy="70" r="1.2" fill="#FFF" opacity="0.7" />
            <circle cx="550" cy="30" r="1.8" fill="#FFF" opacity="0.9" />
          </g>
        ) : (
          // Sun with Rays
          <g className="spin-slow" style={{ transformOrigin: '700px 70px' }}>
            <circle cx="700" cy="70" r="32" fill="#FFD166" filter="drop-shadow(0 0 10px rgba(255,209,102,0.8))" />
            {/* Rays */}
            <line x1="700" y1="20" x2="700" y2="120" stroke="#FFD166" strokeWidth="3" strokeDasharray="5 5" />
            <line x1="650" y1="70" x2="750" y2="70" stroke="#FFD166" strokeWidth="3" strokeDasharray="5 5" />
            <line x1="665" y1="35" x2="735" y2="105" stroke="#FFD166" strokeWidth="3" strokeDasharray="5 5" />
            <line x1="665" y1="105" x2="735" y2="35" stroke="#FFD166" strokeWidth="3" strokeDasharray="5 5" />
          </g>
        )}

        {/* Distant Mountains */}
        <g opacity={darkMode ? "0.3" : "0.5"}>
          <polygon points="100,310 250,150 400,310" fill={darkMode ? "#1C2541" : "#A8DADC"} />
          <polygon points="300,310 480,110 650,310" fill={darkMode ? "#1C2541" : "#A8DADC"} />
          <polygon points="200,310 320,180 450,310" fill={darkMode ? "#22333B" : "#BEE9E8"} />
        </g>

        {/* Clouds */}
        <g opacity={darkMode ? "0.15" : "0.8"}>
          {/* Cloud 1 */}
          <g className="drift-cloud-1">
            <path d="M 100,100 a 20,20 0 0,1 30,0 a 25,25 0 0,1 40,0 a 20,20 0 0,1 15,20 a 10,10 0 0,1 -10,10 L 90,130 a 15,15 0 0,1 10,-30 z" fill="#FFF" />
          </g>
          {/* Cloud 2 */}
          <g className="drift-cloud-2">
            <path d="M 400,60 a 15,15 0 0,1 25,0 a 20,20 0 0,1 30,0 a 15,15 0 0,1 12,15 a 8,8 0 0,1 -8,8 L 390,83 a 12,12 0 0,1 10,-23 z" fill="#FFF" />
          </g>
        </g>

        {/* Wavy Ground Layer */}
        <path
          d="M 0,300 Q 200,280 400,310 T 800,290 L 800,400 L 0,400 Z"
          fill={darkMode ? "url(#groundDark)" : "url(#groundLight)"}
        />

        {/* Swaying Flowers on Ground */}
        <g className="sway" style={{ transformOrigin: '200px 320px' }}>
          <circle cx="150" cy="320" r="3" fill="#E63946" />
          <line x1="150" y1="320" x2="150" y2="330" stroke="#1B4332" strokeWidth="1.5" />
          <circle cx="153" cy="322" r="2.5" fill="#FFD166" />
        </g>
        <g className="sway" style={{ transformOrigin: '350px 330px' }}>
          <circle cx="350" cy="330" r="3" fill="#1A759F" />
          <line x1="350" y1="330" x2="350" y2="340" stroke="#1B4332" strokeWidth="1.5" />
          <circle cx="352" cy="332" r="2.5" fill="#FFD166" />
        </g>
        <g className="sway" style={{ transformOrigin: '600px 315px' }}>
          <circle cx="600" cy="315" r="4" fill="#F4A261" />
          <line x1="600" y1="315" x2="600" y2="325" stroke="#1B4332" strokeWidth="1.5" />
        </g>

        {/* Dynamic Trees */}
        {displayTrees.map((tree) => {
          // Map x percentage position to 800px width
          const posX = (tree.x / 100) * 800;
          const posY = 300; 

          return (
            <g key={tree.id} transform={`translate(${posX}, ${posY})`}>
              {renderTreeSVG(tree)}
            </g>
          );
        })}

        {/* Birds flying animation */}
        <g opacity="0.8">
          {/* Bird 1 */}
          <path
            d="M 0,0 Q 5,-5 10,0 Q 15,-5 20,0 Q 10,5 0,0"
            fill={darkMode ? "#FFF" : "#222"}
            className="flying-bird"
            style={{
              animation: 'fly 15s linear infinite',
              transformBox: 'fill-box'
            }}
          />
          {/* Bird 2 */}
          <path
            d="M 0,0 Q 5,-5 10,0 Q 15,-5 20,0 Q 10,5 0,0"
            fill={darkMode ? "#FFF" : "#222"}
            style={{
              animation: 'fly 22s linear infinite',
              animationDelay: '3s',
              transformBox: 'fill-box'
            }}
          />
        </g>
      </svg>

      {/* Embedded CSS for bird flying animation (since it uses layout position) */}
      <style>{`
        @keyframes fly {
          0% {
            transform: translate(-100px, 80px) scale(0.6);
          }
          50% {
            transform: translate(400px, 40px) scale(0.65);
          }
          100% {
            transform: translate(900px, 90px) scale(0.6);
          }
        }
      `}</style>
    </div>
  );
};

export default ForestScene;
