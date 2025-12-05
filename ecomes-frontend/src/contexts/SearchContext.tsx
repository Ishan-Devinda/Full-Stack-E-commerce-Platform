// src/contexts/SearchContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchInput: string;
    setSearchInput: (input: string) => void;
    triggerSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const triggerSearch = () => {
        setSearchQuery(searchInput);
    };

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery, searchInput, setSearchInput, triggerSearch }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
};
