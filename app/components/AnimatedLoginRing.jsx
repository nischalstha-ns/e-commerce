'use client';

import { motion } from 'framer-motion';

export default function AnimatedLoginRing({ children }) {
  const segments = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {segments.map((segment) => (
          <div
            key={segment}
            className="absolute w-4 h-4 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${segment * 30}deg) translateY(-192px)`,
              background: segment % 2 === 0 
                ? 'linear-gradient(45deg, #00bcd4, #0097a7)' 
                : 'linear-gradient(45deg, #2196f3, #1976d2)',
              boxShadow: segment % 2 === 0
                ? '0 0 20px #00bcd4, 0 0 40px #00bcd4'
                : '0 0 20px #2196f3, 0 0 40px #2196f3',
            }}
          />
        ))}
      </motion.div>
      {children}
    </div>
  );
}