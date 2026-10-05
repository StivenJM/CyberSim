import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
            }}
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
