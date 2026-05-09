declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// TODO: No longer needed, remove when updating to React 19.
// Redecalare forwardRef for making generic easier to use
declare module 'react' {
  function forwardRef<T, P = object>(
    render: (props: P, ref: React.Ref<T>) => React.ReactNode | null,
  ): (props: P & React.RefAttributes<T>) => React.ReactNode | null;
}

declare module 'react' {
  import * as ReactTypings from '@types/react';
  export = ReactTypings;

  // Overwriting forwardRef to make generic types possible to use in prop types
  // This may cause problems with future versions of React
  // TODO: No longer needed, remove when updating to React 19.
  export function forwardRef<T, P = object>(
    render: (props: P, ref: React.Ref<T>) => React.ReactNode | null,
  ): (props: P & React.RefAttributes<T>) => React.ReactNode | null;
}
