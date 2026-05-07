import { Plane } from 'lucide-react';
import { motion } from 'framer-motion';

export function PageLoader(): JSX.Element {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-aviation"
      >
        <Plane size={22} className="text-white" />
      </motion.div>
      <p className="text-sm text-surface-500">Cargando...</p>
    </div>
  );
}
