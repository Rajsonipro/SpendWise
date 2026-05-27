import { motion } from 'framer-motion';

/* ─── Base Shimmer Box ─── */
export const SkeletonBox = ({ className = '', style, ...props }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className={`skeleton ${className}`}
    style={style}
    {...props}
  />
);

/* ─── Text Lines ─── */
export const SkeletonText = ({ lines = 1, width = '100%', lastWidth, className = '' }) => {
  const widths = Array.from({ length: lines }, (_, i) => {
    if (i < lines - 1) return typeof width === 'string' ? width : `${width}%`;
    return lastWidth
      ? typeof lastWidth === 'string'
        ? lastWidth
        : `${lastWidth}%`
      : typeof width === 'string'
        ? width
        : `${width}%`;
  });

  return (
    <div className={`space-y-2.5 ${className}`}>
      {widths.map((w, i) => (
        <SkeletonBox key={i} className="h-3.5 rounded-md" style={{ width: w }} />
      ))}
    </div>
  );
};

/* ─── Avatar / Icon Circle ─── */
export const SkeletonCircle = ({ size = 'w-10 h-10', className = '' }) => (
  <SkeletonBox className={`rounded-full ${size} ${className}`} />
);

/* ─── Stat Card ─── */
export const SkeletonStatCard = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className="card relative overflow-hidden"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 space-y-3">
        <SkeletonBox className="h-3 w-24 rounded-md" />
        <SkeletonBox className="h-8 w-28 rounded-lg" />
      </div>
      <SkeletonBox className="w-[42px] h-[42px] rounded-xl shrink-0" />
    </div>
    <div className="mt-4">
      <SkeletonBox className="h-3 w-36 rounded-md" />
    </div>
  </motion.div>
);

/* ─── Chart Card ─── */
export const SkeletonChart = ({ height = 'h-[280px]', delay = 0, iconSize = 'w-10 h-10' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className="card"
  >
    <div className="flex items-center gap-3 mb-5">
      <SkeletonBox className={`${iconSize} rounded-lg shrink-0`} />
      <SkeletonBox className="h-5 w-40 rounded-md" />
    </div>
    <SkeletonBox className={`w-full ${height} rounded-xl`} />
  </motion.div>
);

/* ─── Table Row ─── */
export const SkeletonTableRow = ({ cols = 5, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.2 }}
    className="flex items-center gap-4 px-4 py-3 border-b border-[var(--app-border-light)]"
  >
    {Array.from({ length: cols }).map((_, i) => (
      <SkeletonBox
        key={i}
        className="h-4 rounded-md"
        style={{ flex: i === cols - 1 ? '0 0 60px' : 1 }}
      />
    ))}
  </motion.div>
);

/* ─── Mobile Transaction Row ─── */
export const SkeletonMobileRow = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.2 }}
    className="flex items-center gap-3 p-4 rounded-xl bg-[var(--app-accent-light)]"
  >
    <SkeletonBox className="w-9 h-9 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBox className="h-4 w-32 rounded-md" />
      <SkeletonBox className="h-3 w-20 rounded-md" />
    </div>
    <SkeletonBox className="h-5 w-20 rounded-md shrink-0" />
  </motion.div>
);

/* ─── Subscription Card ─── */
export const SkeletonSubCard = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className="card"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2">
          <SkeletonBox className="h-4 w-28 rounded-md" />
          <SkeletonBox className="h-3 w-16 rounded-md" />
        </div>
      </div>
    </div>
    <div className="flex items-end justify-between mt-2">
      <div className="space-y-2">
        <SkeletonBox className="h-3 w-32 rounded-md" />
        <SkeletonBox className="h-3 w-24 rounded-md" />
      </div>
      <SkeletonBox className="h-7 w-20 rounded-md" />
    </div>
  </motion.div>
);

/* ─── Page Header Skeleton ─── */
export const SkeletonPageHeader = () => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
  >
    <div className="space-y-2">
      <SkeletonBox className="h-7 w-40 rounded-lg" />
      <SkeletonBox className="h-4 w-56 rounded-md" />
    </div>
    <div className="flex items-center gap-3">
      <SkeletonBox className="h-10 w-32 rounded-xl" />
      <SkeletonBox className="h-10 w-32 rounded-xl" />
    </div>
  </motion.div>
);
