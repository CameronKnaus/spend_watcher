import createContentGetter from 'Content/createContentGetter';
import syntheticChangeEvent from 'Util/Events/syntheticChangeEvent';
import { ComponentProps, KeyboardEvent, ReactNode, Ref, useEffect, useId, useRef, useState } from 'react';
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

function FilterableSelect<T extends string>({
  opens = 'down',
  clearLabel,
  noSelectionText = '',
  optionsList,
  ref,
  ...props
}: FilterableSelectPropTypes<T>) {
  const [selectedValue, setSelectedValue] = useState<FilterableSelectOptionType<T> | undefined>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popOverMenuRef = useRef<HTMLDivElement | null>(null);
  const getContent = createContentGetter('general');
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();

  useEffect(() => {
    function toggleOpen(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }

      const target = event.target as Node;
      const targetWithinBounds = popOverMenuRef.current?.contains(target) || containerRef.current.contains(target);
      setIsOpen(targetWithinBounds);
      // A mouse-driven open/close should never carry over a keyboard highlight from a prior session.
      setActiveIndex(-1);
    }

    document.addEventListener('click', toggleOpen);

    return () => document.removeEventListener('click', toggleOpen);
  }, []);

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

  const filteredOptions = optionsList.filter(filter);
  // One flat, indexable list keeps arrow-key movement and aria-activedescendant in sync with the
  // clear-selection row, which renders after the filtered options but is still keyboard-reachable.
  const navigableItems = [
    ...filteredOptions.map((option, index) => ({
      kind: 'option' as const,
      option,
      id: `${listboxId}-option-${index}`,
    })),
    ...(clearLabel ? [{ kind: 'clear' as const, id: `${listboxId}-clear` }] : []),
  ];

  function selectOption(option: FilterableSelectOptionType<T>) {
    props.onChange?.(syntheticChangeEvent(option.value));
    setSelectedValue(option);
    setFilterText('');
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function clearSelection() {
    // Clear by setting the field to '' rather than `undefined`. react-hook-form's Controller
    // falls back to its defaultValue when a field is set to a nullish value,
    // which would leave the previously-selected option still displayed.
    props.onChange?.(syntheticChangeEvent(''));
    setSelectedValue(undefined);
    setFilterText('');
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      // Prevent the caret from jumping to the start/end of the input text.
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(navigableItems.length > 0 ? 0 : -1);
        return;
      }

      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => {
        if (navigableItems.length === 0) {
          return -1;
        }
        return Math.max(0, Math.min(navigableItems.length - 1, current + direction));
      });
      return;
    }

    if (event.key === 'Enter') {
      // The select is often used inside larger forms; Enter must never bubble into a submit.
      event.preventDefault();

      if (!isOpen) {
        return;
      }

      const activeItem = navigableItems[activeIndex];
      if (!activeItem) {
        return;
      }

      if (activeItem.kind === 'clear') {
        clearSelection();
      } else {
        selectOption(activeItem.option);
      }
      // A mouse selection blurs the input as a side effect of the option div's mousedown (its
      // default action steals focus away, which is what makes currentSelectedValue() render the
      // resolved option name instead of raw filter text). Replicate that here for parity.
      event.currentTarget.blur();
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'Tab') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  const activeDescendantId = isOpen ? navigableItems[activeIndex]?.id : undefined;

  return (
    <div ref={containerRef} className={styles.selectContainer}>
      <input
        ref={ref}
        type="text"
        autoComplete="off"
        {...props}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeDescendantId}
        value={currentSelectedValue()}
        placeholder={noSelectionText}
        onChange={(event) => {
          setFilterText(event.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
      />
      <div className={`${styles.arrow} ${isOpen ? styles.open : ''}`} />
      {isOpen && (
        <div
          ref={popOverMenuRef}
          role="listbox"
          id={listboxId}
          className={styles.options}
          style={opens === 'down' ? { top: '100%' } : { bottom: '100%' }}
        >
          {navigableItems.map((item, index) => {
            const isActive = index === activeIndex;

            if (item.kind === 'clear') {
              return (
                <div
                  key="__clear"
                  id={item.id}
                  role="option"
                  aria-selected={selectedValue === undefined}
                  className={`${styles.option} ${isActive ? styles.active : ''}`}
                  onClick={() => clearSelection()}
                >
                  <div className={styles.clearLabel}>{clearLabel}</div>
                </div>
              );
            }

            const { option } = item;
            const isSelected = selectedValue?.value === option.value;

            return (
              <div
                key={option.value}
                id={item.id}
                role="option"
                aria-selected={isSelected}
                className={`${styles.option} ${isSelected ? styles.selected : ''} ${isActive ? styles.active : ''}`}
                onClick={() => selectOption(option)}
              >
                {option.customRender?.(option.optionName, option.value) ?? option.optionName}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FilterableSelect;
