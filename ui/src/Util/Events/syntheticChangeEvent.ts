import { ChangeEvent } from 'react';

export default function syntheticChangeEvent(value: string): ChangeEvent<HTMLInputElement> {
  return {
    // @ts-expect-error - This is a synthetic event
    target: {
      value: value,
    },
  };
}
