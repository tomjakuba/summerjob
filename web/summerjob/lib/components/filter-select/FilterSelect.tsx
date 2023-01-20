"use client";
import { createRef, CSSProperties, useEffect, useState } from "react";

export interface FilterSelectItem {
  id: string;
  name: string;
  searchable: string;
  item: React.ReactNode;
}

interface FilterSelectProps {
  items: FilterSelectItem[];
  onSelected: (item: FilterSelectItem) => void;
}

const DEFAULT: FilterSelectItem = {
  id: "DEFAULT_OPTION",
  name: "Vyberte možnost",
  searchable: "",
  item: <></>,
};

export function FilterSelect({ items, onSelected }: FilterSelectProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(DEFAULT);
  const [open, setOpen] = useState(false);
  const inputRef = createRef<HTMLInputElement>();
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
  useEffect(() => {
    if (!open) {
      setDropdownStyle({});
      return;
    }
    if (inputRef.current) {
      setDropdownStyle({
        display: "block",
        transform: `translate(0px, ${inputRef.current?.scrollHeight}px)`,
      });
    }
  }, [open]);

  const selectItem = (item: FilterSelectItem) => {
    setSelected(item);
    setSearch(item.name);
    setOpen(false);
    onSelected(item);
  };

  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  const shouldShowItem = (item: FilterSelectItem) => {
    const isSearchEmpty = search.length === 0 || search === selected.name;
    return (
      isSearchEmpty ||
      item.searchable.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className="dropdown" onBlur={onBlur}>
      <div className="p-0" aria-expanded="false">
        <input
          className="p-2 form-control"
          type="text"
          placeholder={selected?.name}
          style={{ border: "0px", outline: "0px" }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        ></input>
      </div>

      <ul
        className="dropdown-menu smj-dropdown-menu w-100"
        style={dropdownStyle}
      >
        {items.map((item) => {
          return (
            shouldShowItem(item) && (
              <li key={item.id}>
                <button
                  className="dropdown-item"
                  type="button"
                  onClick={() => selectItem(item)}
                >
                  {item.item}
                </button>
              </li>
            )
          );
        })}
      </ul>
    </div>
  );
}
