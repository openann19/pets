'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { SubscriptionManager } from '../../src/components/Premium/SubscriptionManager';
// import { usePremiumAnimations } from '@pawfectmatch/ui/hooks/usePremiumAnimations';

export default function SubscriptionPage() {
  // const { triggerAnimation, triggerAnimationFrameAnimation, morph } = usePremiumAnimations();

  useEffect(() => {
    // Animate page entrance with premium animation
    // triggerAnimationFrameAnimation('subscription-page', {
    //   type: 'morph',
    //   duration: 800
    // });
  }, []);

  return (
    <div
      id="subscription-page"
      className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <SubscriptionManager />
      </motion.div>
    </div>
  );
}
