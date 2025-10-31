"use client";

import React, { useState, useEffect, useRef } from "react";
import "./Autocomplete.css";

type AutocompletePayload<T extends Record<string, unknown>> = {
  items: Array<T>;
  pageMeta: {
    totalResults: number;
    pageNumber: number;
    resultsPerPage: number;
  };
};

export type AutocompleteProps<T extends Record<string, unknown>, TKey extends keyof T> = {
  searchFn: (searchTerm: string, pageNumber: number) => Promise<AutocompletePayload<T>>;
  renderItem: (item: T) => React.ReactNode;
  itemKey: TKey;

  onSelectValue?: (itemKey: TKey, itemValue: T) => void;

  /**
   * When an item is selected, this function is used to determine what string appears in the input box. 
   * @param item 
   * @returns 
   */
  selectedValueDisplayStringFn: (item: T) => string;
};

export function Autocomplete<T extends Record<string, unknown>, TKey extends keyof T>({
  searchFn,
  renderItem,
  itemKey,
  onSelectValue,
  selectedValueDisplayStringFn
}: AutocompleteProps<T, TKey>) {



  const [searchTerm, setSearchTerm] = useState<string>("");
  const [items, setItems] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;

    try {
      setIsSearching(true);
      setSearchTerm(newSearchTerm);
      const result = await searchFn(newSearchTerm, 1);
      setItems(result.items);
    } finally {
      setIsSearching(false);
    }
  };

  const handleItemSelect = (item: T, index: number) => {
    setHighlightedIndex(index);

    const prettyName = selectedValueDisplayStringFn(item);
    inputRef.current!.value = prettyName;
    setSearchTerm("");
    setItems([])
    onSelectValue?.(itemKey, item);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => {
        if (prev === null || prev === items.length - 1) return 0;
        return prev + 1;
      });
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => {
        if (prev === null || prev === 0) return items.length - 1;
        return prev - 1;
      });
      e.preventDefault();
    } else if (e.key === "Enter" && highlightedIndex !== null && items[highlightedIndex]) {
      handleItemSelect(items[highlightedIndex], highlightedIndex);

    }
  };

  const handleBlur = () => {
    // Optionally hide dropdown on blur
    // setItems([]); 
  };

  const showNoResults = items.length === 0 && !isSearching && searchTerm.length > 0;
  const showSearching = isSearching && items.length === 0;

  return (
    <div className="autocomplete">
      <input
        ref={inputRef}
        type="text"
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Type to search..."
        className="autocomplete-input"
      />
      {showSearching && <div className="autocomplete-searching">Searching...</div>}
      {showNoResults && <div className="autocomplete-no-results">No results.</div>}
      {items.length > 0 && searchTerm.length > 0 && (
        <ul className="autocomplete-list">
          {items.map((item, i) => (
            <li
              key={String(item[itemKey])}
              className={
                highlightedIndex === i ? "autocomplete-item selected" : "autocomplete-item"
              }
              onMouseDown={() => handleItemSelect(item, i)}
            >
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}