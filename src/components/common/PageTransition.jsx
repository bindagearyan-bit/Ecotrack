import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, y: 0,
      transition: { duration: 0.4 }
    },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
