"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";

interface Option {
  id: number;
  name: string;
}

interface ComboboxProps {
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  createNewLabel?: string;
  // Multi-select mode props
  isMulti?: boolean;
  selectedIds?: number[];
  onChangeMulti?: (ids: number[], newItems: string[]) => void;
  // Single-select mode props
  selectedId?: number | null;
  onChangeSingle?: (id: number | null, newItem: string | null) => void;
}

export default function Combobox({
  options,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari...",
  emptyText = "Opsi tidak ditemukan.",
  createNewLabel = "Tambahkan",
  isMulti = false,
  selectedIds = [],
  onChangeMulti,
  selectedId = null,
  onChangeSingle,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newCreatedItems, setNewCreatedItems] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter existing options
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filter newly created items in this session
  const filteredNewItems = newCreatedItems.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  // Check if search query matches exactly with any existing or newly created item
  const hasExactMatch =
    options.some((opt) => opt.name.toLowerCase() === search.toLowerCase()) ||
    newCreatedItems.some((item) => item.toLowerCase() === search.toLowerCase());

  // Handle item selection in Multi mode
  const handleSelectMulti = (id: number | null, customName: string | null) => {
    if (!onChangeMulti) return;

    if (id !== null) {
      if (selectedIds.includes(id)) {
        onChangeMulti(
          selectedIds.filter((x) => x !== id),
          newCreatedItems
        );
      } else {
        onChangeMulti([...selectedIds, id], newCreatedItems);
      }
    } else if (customName !== null) {
      // Find matching item in newCreatedItems
      const isAlreadyInList = newCreatedItems.some(
        (x) => x.toLowerCase() === customName.toLowerCase()
      );

      if (isAlreadyInList) {
        const updatedNewItems = newCreatedItems.filter(
          (x) => x.toLowerCase() !== customName.toLowerCase()
        );
        setNewCreatedItems(updatedNewItems);
        onChangeMulti(selectedIds, updatedNewItems);
      } else {
        const updatedNewItems = [...newCreatedItems, customName];
        setNewCreatedItems(updatedNewItems);
        onChangeMulti(selectedIds, updatedNewItems);
      }
    }
    setSearch("");
  };

  // Handle item selection in Single mode
  const handleSelectSingle = (id: number | null, customName: string | null) => {
    if (!onChangeSingle) return;

    if (id !== null) {
      if (selectedId === id) {
        onChangeSingle(null, null);
      } else {
        onChangeSingle(id, null);
      }
    } else if (customName !== null) {
      onChangeSingle(null, customName);
    }
    setIsOpen(false);
    setSearch("");
  };

  // Helper: check if item is active/selected
  const isSelected = (id: number | null, customName: string | null): boolean => {
    if (isMulti) {
      if (id !== null) return selectedIds.includes(id);
      if (customName !== null) {
        return newCreatedItems.some((x) => x.toLowerCase() === customName.toLowerCase());
      }
      return false;
    } else {
      if (id !== null) return selectedId === id;
      if (customName !== null) return search.toLowerCase() === customName.toLowerCase();
      return false;
    }
  };

  // Remove tag/badge (Multi-mode only)
  const handleRemoveTag = (e: React.MouseEvent, type: "id" | "custom", value: string | number) => {
    e.stopPropagation();
    if (!onChangeMulti) return;

    if (type === "id") {
      onChangeMulti(
        selectedIds.filter((x) => x !== (value as number)),
        newCreatedItems
      );
    } else {
      const updatedNewItems = newCreatedItems.filter((x) => x !== (value as string));
      setNewCreatedItems(updatedNewItems);
      onChangeMulti(selectedIds, updatedNewItems);
    }
  };

  // Get display label for single mode
  const getSingleLabel = (): string => {
    if (selectedId !== null) {
      const found = options.find((x) => x.id === selectedId);
      return found ? found.name : placeholder;
    }
    // If a new item is typed and selected
    return placeholder;
  };

  return (
    <div className="relative w-full font-sans" ref={containerRef}>
      {/* Trigger Area */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] w-full flex flex-wrap gap-1.5 items-center justify-between px-3.5 py-1.5 border border-border rounded-xl bg-background text-foreground text-sm cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      >
        {isMulti ? (
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {selectedIds.length === 0 && newCreatedItems.length === 0 && (
              <span className="text-muted-foreground/60 text-xs sm:text-sm">{placeholder}</span>
            )}
            {selectedIds.map((id) => {
              const item = options.find((o) => o.id === id);
              if (!item) return null;
              return (
                <span
                  key={`id-${id}`}
                  className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold"
                >
                  {item.name}
                  <X
                    className="h-3 w-3 hover:text-destructive transition-colors cursor-pointer"
                    onClick={(e) => handleRemoveTag(e, "id", id)}
                  />
                </span>
              );
            })}
            {newCreatedItems.map((item) => (
              <span
                key={`custom-${item}`}
                className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-2.5 py-0.5 rounded-full text-xs font-semibold"
              >
                {item}
                <X
                  className="h-3 w-3 hover:text-destructive transition-colors cursor-pointer"
                  onClick={(e) => handleRemoveTag(e, "custom", item)}
                />
              </span>
            ))}
          </div>
        ) : (
          <span className="truncate flex-1">
            {getSingleLabel()}
          </span>
        )}
        <ChevronDown className="h-4 w-4 text-muted-foreground/60 flex-shrink-0 ml-1.5" />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col max-h-[300px]">
          {/* Search box */}
          <div className="p-2 border-b border-border bg-muted/20">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* List Options */}
          <div className="overflow-y-auto flex-1 py-1">
            {/* Show search options */}
            {filteredOptions.map((opt) => {
              const active = isSelected(opt.id, null);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    isMulti ? handleSelectMulti(opt.id, null) : handleSelectSingle(opt.id, null)
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs sm:text-sm hover:bg-muted/80 transition-colors ${
                    active ? "bg-primary/5 text-primary font-semibold" : "text-foreground"
                  }`}
                >
                  <span>{opt.name}</span>
                  {active && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}

            {/* Show newly created items list */}
            {isMulti &&
              filteredNewItems.map((item) => {
                const active = isSelected(null, item);
                return (
                  <button
                    key={`custom-opt-${item}`}
                    type="button"
                    onClick={() => handleSelectMulti(null, item)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs sm:text-sm bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 font-medium transition-colors"
                  >
                    <span>{item}</span>
                    {active && <Check className="h-4 w-4 text-emerald-500" />}
                  </button>
                );
              })}

            {/* Create option button when search does not have exact match */}
            {search.trim() !== "" && !hasExactMatch && (
              <button
                type="button"
                onClick={() => {
                  if (isMulti) {
                    handleSelectMulti(null, search);
                  } else {
                    handleSelectSingle(null, search);
                  }
                }}
                className="w-full flex items-center gap-1.5 px-3 py-2.5 text-left text-xs sm:text-sm text-primary bg-primary/5 hover:bg-primary/10 font-bold border-t border-border transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>
                  {createNewLabel} &ldquo;{search}&rdquo;
                </span>
              </button>
            )}

            {filteredOptions.length === 0 &&
              filteredNewItems.length === 0 &&
              search.trim() === "" && (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  {emptyText}
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
