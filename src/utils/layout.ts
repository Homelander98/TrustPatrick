import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export function useIsTablet() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const minDimension = Math.min(width, height);
    return minDimension >= 768;
  }, [width, height]);
}

export function clamp(numberValue: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(max, numberValue));
}
