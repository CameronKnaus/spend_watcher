import { useSpring } from '@react-spring/web';

export default function useNavSelectionSpring(isCurrentRoute: boolean) {
  const selectionState = isCurrentRoute
    ? {
        width: '100%',
        height: '100%',
      }
    : {
        width: '0%',
        height: '0%',
      };

  return useSpring({
    from: selectionState,
    to: selectionState,
    config: {
      mass: 1,
      friction: 15,
      tension: 80,
    },
  });
}
