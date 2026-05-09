type BaseDimensions = {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

export type CanvasDimensions = BaseDimensions & {
  boundedWidth: number;
  boundedHeight: number;
};

// Simple helper that also provides the boundedWidth and boundedHeight of a canvas
export default function useCanvasDimensions(dimensions: BaseDimensions): CanvasDimensions {
  return {
    ...dimensions,
    boundedWidth: dimensions.width - dimensions.margin.left - dimensions.margin.right,
    boundedHeight: dimensions.height - dimensions.margin.top - dimensions.margin.bottom,
  };
}
