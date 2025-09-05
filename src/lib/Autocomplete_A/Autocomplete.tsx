import React from 'react';
import './Autocomplete.css';

export type AutocompleteProps<T> = {

  searchValue: string;
  onChangeSearchValue: (str: string) => void;

  selectedValue: T | null;
  onSelectValue: (value: T) => void;

  renderItem: (value: T) => React.ReactNode;

  isLoading: boolean;
  availableOptions: Array<T>;

}


export function Autocomplete<T>(props: AutocompleteProps<T>) {
  const {
    searchValue,
    onChangeSearchValue,
    selectedValue,
    onSelectValue,
    renderItem,
    isLoading,
    availableOptions
  } = props;

  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  // Show dropdown when there's a search value or options available
  const shouldShowDropdown = isOpen && (searchValue.length > 0 || availableOptions.length > 0);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChangeSearchValue(value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Handle input blur with delay to allow for option selection
  const handleInputBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  // Handle option selection
  const handleOptionSelect = (option: T) => {
    onSelectValue(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!shouldShowDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < availableOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < availableOptions.length) {
          handleOptionSelect(availableOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="autocomplete">
      <input
        ref={inputRef}
        type="text"
        className="autocomplete-input"
        value={searchValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        autoComplete="off"
      />

      {shouldShowDropdown && (
        <>
          {isLoading && (
            <div className="autocomplete-loading">
              Loading...
            </div>
          )}

          {!isLoading && searchValue.length > 0 && availableOptions.length === 0 && (
            <div className="autocomplete-no-results">
              No results found
            </div>
          )}

          {!isLoading && availableOptions.length > 0 && (
            <ul ref={listRef} className="autocomplete-list">
              {availableOptions.map((option, index) => (
                <li
                  key={index}
                  className={`autocomplete-item ${index === highlightedIndex ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {renderItem(option)}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}