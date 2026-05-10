import useContent from 'Hooks/useContent';
import syntheticChangeEvent from 'Util/Events/syntheticChangeEvent';
import { ComponentProps, ReactNode, Ref, useEffect, useRef, useState } from 'react';
import styles from './FilterableSelect.module.css';

export type FilterableSelectOptionType<T> = {
  value: T;
  optionName: string;
  customRender?: (optionName: string, value: T) => ReactNode;
};

export type FilterableSelectPropTypes<T> = {
  opens?: 'up' | 'down';
  noSelectionText?: string;
  clearLabel?: string;
  optionsList: FilterableSelectOptionType<T>[];
  ref?: Ref<HTMLInputElement>;
} & ComponentProps<'input'>;

function FilterableSelect<T extends string>(
  { opens = 'down', clearLabel, noSelectionText = '', optionsList, ref, ...props }: FilterableSelectPropTypes<T>,
) {
  const [selectedValue, setSelectedValue] = useState<FilterableSelectOptionType<T> | undefined>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popOverMenuRef = useRef<HTMLDivElement | null>(null);
  const getContent = useContent('general');
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    function toggleOpen(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }

      const target = event.target as Node;
      const targetWithinBounds = popOverMenuRef.current?.contains(target) || containerRef.current.contains(target);
      setIsOpen(targetWithinBounds);
    }

    document.addEventListener('click', toggleOpen);

    return () => document.removeEventListener('click', toggleOpen);
  }, [ref]);

  function filter(option: FilterableSelectOptionType<T>) {
    const targetText = filterText.toLowerCase();
    const optionText = option.optionName.toLowerCase();
    return optionText.includes(targetText);
  }

  function currentSelectedValue() {
    // If the text input is still in focus only show filter text
    if (containerRef.current?.contains(document.activeElement)) {
      return filterText;
    }

    if (props.value) {
      return optionsList.find((option) => option.value === props.value)?.optionName || getContent('empty');
    }

    return '';
  }

  return (
    <div ref={containerRef} className={styles.selectContainer}>
      <input
        ref={ref}
        type="text"
        autoComplete="off"
        {...props}
        value={currentSelectedValue()}
        placeholder={noSelectionText}
        onChange={(event) => {
          setFilterText(event.target.value);
        }}
      />
      <div className={`${styles.arrow} ${isOpen ? styles.open : ''}`} />
      {isOpen && (
        <div
          ref={popOverMenuRef}
          className={styles.options}
          style={opens === 'down' ? { top: '100%' } : { bottom: '100%' }}
        >
          {optionsList.filter(filter).map((option) => (
            <div
              key={option.value}
              className={`${styles.option} ${selectedValue?.value === option.value ? styles.selected : ''}`}
              onClick={() => {
                props.onChange?.(syntheticChangeEvent(option.value));
                setSelectedValue(option);
                setFilterText('');
                setIsOpen(false);
              }}
            >
              {option.customRender?.(option.optionName, option.value) ?? option.optionName}
            </div>
          ))}
          {clearLabel && (
            <div
              className={styles.option}
              onClick={() => {
                // @ts-expect-error What have I done....
                props.onChange?.(syntheticChangeEvent(undefined));
                setSelectedValue(undefined);
                setFilterText('');
                setIsOpen(false);
              }}
            >
              <div className={styles.clearLabel}>{clearLabel}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FilterableSelect;
