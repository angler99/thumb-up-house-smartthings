export type Gesture = 'ONE_FINGER' | 'TWO_FINGERS' | 'THREE_FINGERS' | 'FOUR_FINGERS' | 'FIVE_FINGERS' | 'UNKNOWN';

export const GESTURE_MAP: Record<Gesture, string> = {
  ONE_FINGER: 'Turn Bulb On',
  TWO_FINGERS: 'Turn Bulb Off',
  THREE_FINGERS: 'Toggle Bulb',
  FOUR_FINGERS: 'No action defined',
  FIVE_FINGERS: 'No action defined',
  UNKNOWN: 'Gesture not recognized',
};
