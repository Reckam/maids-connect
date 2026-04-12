"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center gradient-bg text-white"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 1, 
              ease: "easeOut",
              scale: { type: "spring", stiffness: 100 }
            }}
            className="flex flex-col items-center gap-4"
          >
            <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm shadow-xl">
              <ShieldCheck className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Maids Connect</h1>
            <p className="text-lg opacity-90 font-medium">Connecting Maids and Employers Across Uganda</p>
          </motion.div>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="h-1 bg-white/30 rounded-full mt-12 overflow-hidden"
          >
            <motion.div 
              className="h-full bg-white"
              animate={{ 
                x: [-200, 200],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5, 
                ease: "linear" 
              }}
              style={{ width: '100px' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}