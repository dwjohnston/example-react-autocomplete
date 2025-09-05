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

type AutocompleteProps<T extends Record<string, unknown>, TKey extends keyof T> = {
  searchFn: (searchTerm: string, pageNumber: number) => Promise<AutocompletePayload<T>>;
  renderItem: (item: T) => React.ReactNode;
  itemKey: TKey;
  defaultSelectedValue?: T[TKey];
  onSelectValue: (itemKey: TKey, itemValue: T) => void;
};

export function Autocomplete<T extends Record<string, unknown>, TKey extends keyof T>({
  searchFn,
  renderItem,
  itemKey,
  defaultSelectedValue,
  onSelectValue,
}: AutocompleteProps<T, TKey>) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [pageMeta, setPageMeta] = useState<AutocompletePayload<T>["pageMeta"]>({
    totalResults: 0,
    pageNumber: 1,
    resultsPerPage: 10,
  });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce for searching effect
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setIsSearching(false);
    searchFn(searchTerm, pageMeta.pageNumber)
      .then((result) => {
        if (active) {
          setItems(result.items);
          setPageMeta(result.pageMeta);
          setLoading(false);
          setIsSearching(false);
          setSelectedIndex(null);
        }
      })
      .catch(() => {
        setLoading(false);
        setIsSearching(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line
  }, [searchTerm, pageMeta.pageNumber, searchFn]);

  // Optionally pre-select the default value
  useEffect(() => {
    if (!defaultSelectedValue) return;
    const foundIndex = items.findIndex(
      (item) => item[itemKey] === defaultSelectedValue
    );
    if (foundIndex >= 0) setSelectedIndex(foundIndex);
  }, [items, defaultSelectedValue, itemKey]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSearching(!!items.length || loading ? true : false);
    setSearchTerm(e.target.value);
    setPageMeta((meta) => ({ ...meta, pageNumber: 1 }));
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setIsSearching(false);
    }, 400);
  };

  const handleItemClick = (item: T, index: number) => {
    setSelectedIndex(index);
    onSelectValue(itemKey, item);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => {
        if (prev === null || prev === items.length - 1) return 0;
        return prev + 1;
      });
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => {
        if (prev === null || prev === 0) return items.length - 1;
        return prev - 1;
      });
      e.preventDefault();
    } else if (e.key === "Enter" && selectedIndex !== null && items[selectedIndex]) {
      const item = items[selectedIndex];
      onSelectValue(itemKey, item);
    }
  };

  const handleBlur = () => {
    // Optionally hide dropdown on blur
    // setItems([]); 
  };

  const goToPage = (page: number) => {
    setPageMeta((meta) => ({ ...meta, pageNumber: page }));
  };

  const showNoResults = !loading && !items.length && !isSearching;
  const showSearching = isSearching && !loading && !items.length;

  return (
    <div className="autocomplete">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Type to search..."
        className="autocomplete-input"
      />
      {loading && <div className="autocomplete-loading">Loading...</div>}
      {showSearching && <div className="autocomplete-searching">Searching...</div>}
      {showNoResults && <div className="autocomplete-no-results">No results.</div>}
      {items.length > 0 && (
        <ul className="autocomplete-list">
          {items.map((item, i) => (
            <li
              key={String(item[itemKey])}
              className={
                selectedIndex === i ? "autocomplete-item selected" : "autocomplete-item"
              }
              onMouseDown={() => handleItemClick(item, i)}
            >
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
      <div className="autocomplete-pagination">
        {pageMeta.pageNumber > 1 && (
          <button onClick={() => goToPage(pageMeta.pageNumber - 1)}>Prev</button>
        )}
        {pageMeta.pageNumber * pageMeta.resultsPerPage < pageMeta.totalResults && (
          <button onClick={() => goToPage(pageMeta.pageNumber + 1)}>Next</button>
        )}
      </div>
    </div>
  );
}