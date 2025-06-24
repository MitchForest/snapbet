import React, { useEffect, useState, useRef } from 'react';

// Get screen dimensions
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

// Batch 2 Effect Configurations
const BATCH2_EFFECTS = {
  // VIBES
  crying_laughing: {
    id: 'crying_laughing',
    name: "😂 Can't Stop",
    particles: [{ emoji: '😂', count: 20 }],
    physics: 'bounce',
    duration: 'continuous'
  },
  no_cap: {
    id: 'no_cap',
    name: '🧢 No Cap',
    particles: [{ emoji: '🧢', count: 15 }],
    physics: 'spinAway',
    duration: 2000
  },
  clown_check: {
    id: 'clown_check',
    name: '🤡 Clown Check',
    particles: [
      { emoji: '🤡', count: 1, size: 80 },
      { emoji: '🤡', count: 8, size: 30 }
    ],
    physics: 'zoomDance',
    duration: 2000
  },
  vibing: {
    id: 'vibing',
    name: '😌 Vibing',
    particles: [
      { emoji: '😌', count: 5 },
      { emoji: '✨', count: 15 },
      { emoji: '🎵', count: 10 }
    ],
    physics: 'gentleFloat',
    duration: 'continuous'
  },
  bussin: {
    id: 'bussin',
    name: '🔥 Bussin FR',
    particles: [
      { emoji: '🔥', count: 10 },
      { emoji: '💯', count: 5 },
      { emoji: '🚀', count: 3 }
    ],
    physics: 'explodeOut',
    duration: 2000
  },
  sus: {
    id: 'sus',
    name: "🤨 That's Sus",
    particles: [
      { emoji: '🤨', count: 8 },
      { emoji: '👀', count: 12 }
    ],
    physics: 'lookAround',
    duration: 'continuous'
  },
  big_w: {
    id: 'big_w',
    name: '🏆 Big W',
    particles: [{ emoji: '🏆', count: 25 }],
    physics: 'formLetter',
    letterType: 'W',
    duration: 2000
  },
  big_l: {
    id: 'big_l',
    name: '😢 Big L',
    particles: [{ emoji: '😢', count: 20 }],
    physics: 'formLetter',
    letterType: 'L',
    duration: 2000
  },
  // WINS
  trending_up: {
    id: 'trending_up',
    name: '📈 Trending Up',
    particles: [
      { emoji: '📈', count: 3 },
      { emoji: '💹', count: 2 },
      { emoji: '⬆️', count: 5 }
    ],
    physics: 'riseUp',
    duration: 2000
  },
  too_cool: {
    id: 'too_cool',
    name: '😎 Too Cool',
    particles: [{ emoji: '😎', count: 1, size: 80 }],
    physics: 'slideDown',
    duration: 1500
  },
  flex: {
    id: 'flex',
    name: '💪 Flex',
    particles: [{ emoji: '💪', count: 2 }],
    physics: 'flexPump',
    duration: 'continuous'
  }
};

// Batch 2 Particle Component
const Batch2Particle = ({ emoji, index, physics, duration, size = 30, totalCount, letterType, onComplete }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const delay = index * 30;
    const scaleFactor = size / 30;
    
    switch (physics) {
      case 'bounce':
        // Crying laughing bounce effect
        const bounceX = Math.random() * SCREEN_WIDTH;
        const bounceY = SCREEN_HEIGHT / 2 + (Math.random() - 0.5) * 200;
        
        setTimeout(() => {
          setPosition({ x: bounceX, y: bounceY });
          setScale(scaleFactor);
          
          let time = 0;
          const animate = () => {
            time += 0.016;
            const newY = bounceY + Math.sin(time * 3) * 50;
            setPosition(prev => ({ ...prev, y: newY }));
            setRotation(Math.sin(time * 2) * 10);
            
            animationRef.current = requestAnimationFrame(animate);
          };
          animate();
        }, delay);
        break;
        
      case 'spinAway':
        // Caps spinning away
        setTimeout(() => {
          setPosition({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 });
          setScale(scaleFactor * 1.2);
          
          let progress = 0;
          const angle = (Math.PI * 2 * index) / totalCount;
          const distance = 200 + Math.random() * 100;
          
          const animate = () => {
            progress += 0.02;
            if (progress <= 1) {
              setRotation(720 * progress);
              const easeOut = 1 - Math.pow(1 - progress, 3);
              setPosition({
                x: SCREEN_WIDTH / 2 + Math.cos(angle) * distance * easeOut,
                y: SCREEN_HEIGHT / 2 + Math.sin(angle) * distance * easeOut
              });
              if (progress > 0.8) {
                setOpacity(1 - (progress - 0.8) * 5);
              }
              animationRef.current = requestAnimationFrame(animate);
            } else {
              onComplete && onComplete();
            }
          };
          animate();
        }, delay);
        break;
        
      case 'zoomDance':
        // Clown zoom and dance
        if (index === 0) {
          // Big center clown
          setPosition({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 });
          
          let progress = 0;
          const animate = () => {
            progress += 0.02;
            if (progress <= 1) {
              // Zoom in effect
              if (progress < 0.3) {
                setScale(scaleFactor * (progress / 0.3));
                setRotation(360 * (progress / 0.3));
              } else {
                setScale(scaleFactor);
                setRotation(Math.sin(progress * 10) * 10);
              }
              animationRef.current = requestAnimationFrame(animate);
            } else {
              onComplete && onComplete();
            }
          };
          animate();
        } else {
          // Small dancing clowns
          setTimeout(() => {
            const angle = (Math.PI * 2 * (index - 1)) / (totalCount - 1);
            const radius = 150;
            
            let time = 0;
            const animate = () => {
              time += 0.02;
              setPosition({
                x: SCREEN_WIDTH / 2 + Math.cos(angle + time) * radius,
                y: SCREEN_HEIGHT / 2 + Math.sin(angle + time) * radius
              });
              setScale(scaleFactor);
              setRotation(time * 180);
              
              if (time < 2) {
                animationRef.current = requestAnimationFrame(animate);
              } else {
                onComplete && onComplete();
              }
            };
            animate();
          }, 500 + delay);
        }
        break;
        
      case 'gentleFloat':
        // Vibing gentle float
        const floatX = Math.random() * SCREEN_WIDTH;
        const floatY = SCREEN_HEIGHT * 0.3 + Math.random() * SCREEN_HEIGHT * 0.4;
        
        setTimeout(() => {
          setPosition({ x: floatX, y: floatY });
          setScale(scaleFactor);
          
          let time = 0;
          const animate = () => {
            time += 0.01;
            const offsetX = Math.sin(time) * 15;
            const offsetY = Math.sin(time * 0.7) * 20;
            
            setPosition({
              x: floatX + offsetX,
              y: emoji === '🎵' ? floatY - time * 20 : floatY + offsetY
            });
            
            if (emoji === '🎵' && floatY - time * 20 < -50) {
              setPosition({ x: Math.random() * SCREEN_WIDTH, y: SCREEN_HEIGHT + 50 });
              time = 0;
            }
            
            animationRef.current = requestAnimationFrame(animate);
          };
          animate();
        }, delay);
        break;
        
      case 'explodeOut':
        // Bussin explosion
        setTimeout(() => {
          setPosition({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 });
          
          let progress = 0;
          const angle = Math.random() * Math.PI * 2;
          const distance = 150 + Math.random() * 150;
          
          const animate = () => {
            progress += 0.025;
            if (progress <= 1) {
              // Scale effect
              if (progress < 0.2) {
                setScale(scaleFactor * 1.5 * (progress / 0.2));
              } else {
                setScale(scaleFactor);
              }
              
              // Move outward
              const easeOut = 1 - Math.pow(1 - progress, 2);
              setPosition({
                x: SCREEN_WIDTH / 2 + Math.cos(angle) * distance * easeOut,
                y: SCREEN_HEIGHT / 2 + Math.sin(angle) * distance * easeOut
              });
              
              setRotation(progress * 720);
              
              if (progress > 0.8) {
                setOpacity(1 - (progress - 0.8) * 5);
              }
              
              animationRef.current = requestAnimationFrame(animate);
            } else {
              onComplete && onComplete();
            }
          };
          animate();
        }, delay * 0.5);
        break;
        
      case 'lookAround':
        // Sus eyes looking around
        const lookX = Math.random() * SCREEN_WIDTH;
        const lookY = SCREEN_HEIGHT * 0.2 + Math.random() * SCREEN_HEIGHT * 0.6;
        
        setTimeout(() => {
          setPosition({ x: lookX, y: lookY });
          setScale(scaleFactor);
          
          let time = 0;
          const animate = () => {
            time += 0.02;
            
            if (emoji === '👀') {
              // Eyes dart around
              const dartX = lookX + Math.sin(time * 5) * 50;
              setPosition(prev => ({ ...prev, x: dartX }));
            } else {
              // Eyebrows move up and down
              const moveY = lookY + Math.sin(time * 3) * 10;
              setPosition(prev => ({ ...prev, y: moveY }));
            }
            
            animationRef.current = requestAnimationFrame(animate);
          };
          animate();
        }, delay);
        break;
        
      case 'formLetter':
        // W/L formation
        setTimeout(() => {
          let targetX, targetY;
          
          if (letterType === 'W') {
            const segment = Math.floor(index / (totalCount / 4));
            const segmentProgress = (index % (totalCount / 4)) / (totalCount / 4);
            
            switch (segment) {
              case 0:
                targetX = SCREEN_WIDTH * 0.3;
                targetY = SCREEN_HEIGHT * 0.3 + segmentProgress * 200;
                break;
              case 1:
                targetX = SCREEN_WIDTH * 0.3 + segmentProgress * 60;
                targetY = SCREEN_HEIGHT * 0.5 - segmentProgress * 100;
                break;
              case 2:
                targetX = SCREEN_WIDTH * 0.45 + segmentProgress * 60;
                targetY = SCREEN_HEIGHT * 0.4 + segmentProgress * 100;
                break;
              case 3:
                targetX = SCREEN_WIDTH * 0.6 + segmentProgress * 60;
                targetY = SCREEN_HEIGHT * 0.5 - segmentProgress * 200;
                break;
            }
          } else {
            if (index < totalCount * 0.6) {
              targetX = SCREEN_WIDTH * 0.4;
              targetY = SCREEN_HEIGHT * 0.3 + (index / (totalCount * 0.6)) * 200;
            } else {
              const horizProgress = (index - totalCount * 0.6) / (totalCount * 0.4);
              targetX = SCREEN_WIDTH * 0.4 + horizProgress * 150;
              targetY = SCREEN_HEIGHT * 0.5;
            }
          }
          
          // Start from random position
          setPosition({ x: Math.random() * SCREEN_WIDTH, y: Math.random() * SCREEN_HEIGHT });
          setOpacity(0);
          
          let progress = 0;
          const animate = () => {
            progress += 0.02;
            if (progress <= 1) {
              const easeOut = 1 - Math.pow(1 - progress, 3);
              setPosition({
                x: position.x + (targetX - position.x) * easeOut,
                y: position.y + (targetY - position.y) * easeOut
              });
              setScale(scaleFactor * easeOut);
              setOpacity(easeOut);
              
              if (progress > 0.8) {
                // Pulse effect
                setScale(scaleFactor * (1 + Math.sin((progress - 0.8) * 20) * 0.2));
              }
              
              animationRef.current = requestAnimationFrame(animate);
            } else {
              onComplete && onComplete();
            }
          };
          animate();
        }, delay);
        break;
        
      case 'riseUp':
        // Charts rising up
        const chartX = SCREEN_WIDTH * 0.3 + index * 80;
        const startY = SCREEN_HEIGHT * 0.7;
        const endY = SCREEN_HEIGHT * 0.3 - index * 30;
        
        setTimeout(() => {
          setPosition({ x: chartX, y: startY });
          
          let progress = 0;
          const animate = () => {
            progress += 0.025;
            if (progress <= 1) {
              const easeOut = 1 - Math.pow(1 - progress, 3);
              setPosition({
                x: chartX,
                y: startY + (endY - startY) * easeOut
              });
              setScale(scaleFactor * easeOut);
              
              // Arrows shoot up
              if (emoji === '⬆️' && progress > 0.5) {
                const arrowProgress = (progress - 0.5) * 2;
                setPosition({
                  x: chartX,
                  y: endY - arrowProgress * 300
                });
                setOpacity(1 - arrowProgress);
              }
              
              animationRef.current = requestAnimationFrame(animate);
            } else {
              onComplete && onComplete();
            }
          };
          animate();
        }, delay);
        break;
        
      case 'slideDown':
        // Cool slide down
        setPosition({ x: SCREEN_WIDTH / 2, y: -100 });
        setScale(scaleFactor);
        setRotation(-180);
        
        let progress = 0;
        const animate = () => {
          progress += 0.02;
          if (progress <= 1) {
            const spring = 1 - Math.cos(progress * Math.PI * 0.5);
            setPosition({
              x: SCREEN_WIDTH / 2,
              y: -100 + (SCREEN_HEIGHT * 0.5) * spring
            });
            setRotation(-180 + 180 * spring);
            
            if (progress > 0.8) {
              // Cool bounce
              const bounce = Math.sin((progress - 0.8) * 10) * 20;
              setPosition(prev => ({ ...prev, y: prev.y + bounce }));
            }
            
            animationRef.current = requestAnimationFrame(animate);
          } else {
            onComplete && onComplete();
          }
        };
        animate();
        break;
        
      case 'flexPump':
        // Muscle flex
        const isLeft = index === 0;
        const flexX = isLeft ? SCREEN_WIDTH * 0.3 : SCREEN_WIDTH * 0.7;
        
        setPosition({ x: flexX, y: SCREEN_HEIGHT / 2 });
        setScale(scaleFactor);
        if (!isLeft) setRotation(180);
        
        let time = 0;
        const animate = () => {
          time += 0.03;
          const pump = 1 + Math.sin(time * 3) * 0.3;
          setScale(scaleFactor * pump);
          setPosition({
            x: flexX,
            y: SCREEN_HEIGHT / 2 + Math.sin(time * 3) * 10
          });
          
          animationRef.current = requestAnimationFrame(animate);
        };
        
        setTimeout(animate, isLeft ? 0 : 200);
        break;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity: opacity,
        fontSize: '30px',
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      {emoji}
    </div>
  );
};

// Effect Component
const Effect = ({ config, onComplete }) => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const newParticles = [];
    let id = 0;
    
    config.particles.forEach(particleConfig => {
      for (let i = 0; i < particleConfig.count; i++) {
        newParticles.push({
          id: id++,
          emoji: particleConfig.emoji,
          size: particleConfig.size || 30
        });
      }
    });
    
    setParticles(newParticles);
  }, [config]);
  
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {particles.map((particle, index) => (
        <Batch2Particle
          key={particle.id}
          emoji={particle.emoji}
          index={index}
          physics={config.physics}
          duration={config.duration === 'continuous' ? null : config.duration}
          size={particle.size}
          totalCount={particles.length}
          letterType={config.letterType}
          onComplete={config.duration !== 'continuous' ? onComplete : undefined}
        />
      ))}
    </div>
  );
};

// Main Demo Component
export default function Batch2Demo() {
  const [activeEffect, setActiveEffect] = useState(null);
  const [category, setCategory] = useState('vibes');
  
  const vibesEffects = ['crying_laughing', 'no_cap', 'clown_check', 'vibing', 'bussin', 'sus', 'big_w', 'big_l'];
  const winsEffects = ['trending_up', 'too_cool', 'flex'];
  
  const currentEffects = category === 'vibes' ? vibesEffects : winsEffects;
  
  const handleEffectSelect = (effectId) => {
    const config = BATCH2_EFFECTS[effectId];
    setActiveEffect(config);
    
    if (config.duration !== 'continuous') {
      setTimeout(() => {
        setActiveEffect(null);
      }, config.duration);
    }
  };
  
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#000', overflow: 'hidden' }}>
      {/* Mock Camera View */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📸</div>
          <div style={{ fontSize: '18px' }}>Camera View</div>
          <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
            {activeEffect ? `Active: ${activeEffect.name}` : 'Select an effect below'}
          </div>
        </div>
      </div>
      
      {/* Effect Layer */}
      {activeEffect && (
        <Effect 
          config={activeEffect}
          onComplete={() => setActiveEffect(null)}
        />
      )}
      
      {/* Category Tabs */}
      <div style={{
        position: 'absolute',
        bottom: 200,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: '10px'
      }}>
        <button
          onClick={() => setCategory('vibes')}
          style={{
            padding: '10px 30px',
            backgroundColor: category === 'vibes' ? '#9C27B0' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          🎭 VIBES
        </button>
        <button
          onClick={() => setCategory('wins')}
          style={{
            padding: '10px 30px',
            backgroundColor: category === 'wins' ? '#4CAF50' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          🏆 WINS
        </button>
      </div>
      
      {/* Effect Selector */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        padding: '20px',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center'
        }}>
          {currentEffects.map(effectId => {
            const config = BATCH2_EFFECTS[effectId];
            return (
              <button
                key={effectId}
                onClick={() => handleEffectSelect(effectId)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: activeEffect?.id === effectId ? 
                    (category === 'vibes' ? '#9C27B0' : '#4CAF50') : '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: activeEffect?.id === effectId ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {config.name}
              </button>
            );
          })}
        </div>
        
        {activeEffect && activeEffect.duration === 'continuous' && (
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <button
              onClick={() => setActiveEffect(null)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Stop Effect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}