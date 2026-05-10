import { useEffect, useRef } from 'react';
import { CanvasDimensions } from '../use/useCanvasDimensions/useCanvasDimensions';

type HoverHitBoxPropTypes = {
  dimensions: CanvasDimensions;
  handlePointerMove: (event: React.PointerEvent<SVGRectElement>) => void;
};

// Handles hovering over the chart.  **Must be used inside the bounding box of a chart
export default function HoverHitBox({ dimensions, handlePointerMove }: HoverHitBoxPropTypes) {
  const hitBoxRef = useRef<SVGRectElement>(null);

  // Prevent touch-based scrolling
  useEffect(() => {
    if (!hitBoxRef.current) {
      return;
    }

    function preventBehavior(event: TouchEvent) {
      event.preventDefault();
    }

    const hitBox = hitBoxRef.current;
    hitBox.addEventListener('touchmove', preventBehavior, { passive: false });

    return () => {
      hitBox.removeEventListener('touchmove', preventBehavior);
    };
  }, []);

  return (
    <rect
      ref={hitBoxRef}
      width={dimensions.boundedWidth}
      height={dimensions.boundedHeight}
      fill="transparent"
      style={{ pointerEvents: 'all', touchAction: 'none' }}
      onPointerMove={handlePointerMove}
    />
  );
}
