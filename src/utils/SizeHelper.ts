type HeightWidth = { height: number; width: number };
interface GetClampedSizeOptions {
  size: HeightWidth;
  max?: number;
  maxWidth?: number;
  maxHeight?: number;
  roundToInteger?: boolean;
}

export const getClampedSize = (options: GetClampedSizeOptions): HeightWidth => {
  const size: HeightWidth = { ...options.size };

  if (size.width >= size.height) {
    tryClampSizeByWidth(size, options.maxWidth || options.max);
    tryClampSizeByHeight(size, options.maxHeight || options.max);
  } else {
    tryClampSizeByHeight(size, options.maxHeight || options.max);
    tryClampSizeByWidth(size, options.maxWidth || options.max);
  }

  return options.roundToInteger
    ? {
        height: Math.round(size.height),
        width: Math.round(size.width)
      }
    : size;
};

const tryClampSizeByWidth = (size: HeightWidth, max: number) => {
  if (max && size.width > max) {
    size.height = getHeightByRatio(size, max);
    size.width = max;
  }
};

const tryClampSizeByHeight = (size: HeightWidth, max: number) => {
  if (max && size.height > max) {
    size.width = getWidthByRatio(size, max);
    size.height = max;
  }
};

export const getHeightByRatio = (ratio: HeightWidth, width: number) => {
  return width * (ratio.height / ratio.width);
};

export const getWidthByRatio = (ratio: HeightWidth, height: number) => {
  return height * (ratio.width / ratio.height);
};
