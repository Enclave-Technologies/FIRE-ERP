"use client";
import React, { useState } from "react";
import {
    Filter,
    Plus,
    Search,
    X,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Form from "next/form";
import type { SortDirection, TableFunctionsProps } from "@/types";
import { DEFAULT_PAGE_SIZE } from "@/utils/contants";

const TableFunctions = <TData, TValue>({
    columns = [],
    action,
    onNewClick,
}: TableFunctionsProps<TData, TValue>) => {
    const [selectedFilterColumn, setSelectedFilterColumn] = useState<
        string | null
    >(null);
    const [selectedSortColumn, setSelectedSortColumn] = useState<string | null>(
        null
    );
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [filterValue, setFilterValue] = useState<string>("");
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const handleFilterColumnSelect = (column: string) => {
        setSelectedFilterColumn(column);
    };

    const handleSortColumnSelect = (column: string) => {
        if (selectedSortColumn === column) {
            // Toggle direction if same column is selected
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSelectedSortColumn(column);
            setSortDirection("asc");
        }
    };

    const toggleSortDirection = () => {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    const clearFilter = () => {
        setSelectedFilterColumn(null);
        setFilterValue("");
    };

    const clearSort = () => {
        setSelectedSortColumn(null);
    };

    const toggleSearch = () => {
        setSearchExpanded(!searchExpanded);
        if (!searchExpanded) {
            // Focus the search input when expanded
            setTimeout(() => {
                const searchInput = document.getElementById("search-input");
                if (searchInput) searchInput.focus();
            }, 100);
        }
    };

    const clearSearch = () => {
        setSearchValue("");
    };

    const clearAll = () => {
        // Clear all filters
        setSelectedFilterColumn(null);
        setFilterValue("");
        setSelectedSortColumn(null);
        setSortDirection("asc");
        setSearchValue("");

        // Submit the form after clearing
        setTimeout(() => {
            const form = document.querySelector(
                'form[action="' + action + '"]'
            );
            if (form) {
                (form as HTMLFormElement).requestSubmit();
            }
        }, 0);
    };

    const handleNewClick = () => {
        if (onNewClick) {
            onNewClick();
        }
    };

    return (
        <div className="mb-4 border-b border-gray-800 pb-4">
            <Form action={action}>
                {/* Hidden inputs to include values in form submission */}
                <input
                    type="hidden"
                    name="filterColumn"
                    value={selectedFilterColumn || ""}
                />
                <input type="hidden" name="filterValue" value={filterValue} />
                <input
                    type="hidden"
                    name="sortColumn"
                    value={selectedSortColumn || ""}
                />
                <input
                    type="hidden"
                    name="sortDirection"
                    value={sortDirection}
                />
                <input type="hidden" name="search" value={searchValue} />

                {/* Preserve pagination parameters */}
                <input
                    type="hidden"
                    name="page"
                    value="1" // Reset to page 1 when filters change
                />
                <input
                    type="hidden"
                    name="pageSize"
                    value={
                        typeof window !== "undefined"
                            ? new URLSearchParams(window.location.search).get(
                                  "pageSize"
                              ) || `${DEFAULT_PAGE_SIZE}`
                            : `${DEFAULT_PAGE_SIZE}`
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left side - Filter display area with fixed height */}
                    <div className="min-h-[80px] flex items-center">
                        <div className="w-full">
                            {selectedFilterColumn ? (
                                <div className="space-y-1">
                                    <Label htmlFor="filter-input">
                                        Filter by {selectedFilterColumn}
                                    </Label>
                                    <div className="flex items-center">
                                        <Input
                                            id="filter-input"
                                            placeholder={`Enter value...`}
                                            className="h-8"
                                            value={filterValue}
                                            onChange={(e) =>
                                                setFilterValue(e.target.value)
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={clearFilter}
                                            className="ml-1"
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">
                                    No filters applied
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side - Sort display area with fixed height */}
                    <div className="min-h-[80px] flex items-center">
                        <div className="w-full">
                            {selectedSortColumn ? (
                                <div className="space-y-1">
                                    <Label>Sort by {selectedSortColumn}</Label>
                                    <div className="flex items-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-8 flex items-center gap-1"
                                            onClick={toggleSortDirection}
                                        >
                                            {sortDirection === "asc" ? (
                                                <>
                                                    <ArrowUp size={14} />
                                                    <span>Ascending</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowDown size={14} />
                                                    <span>Descending</span>
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={clearSort}
                                            className="ml-1 h-8 w-8"
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">
                                    No sorting applied
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Toolbar - Always visible */}
                <div className="flex flex-wrap items-center justify-between mt-4">
                    {/* Left side - Action buttons */}
                    <div className="flex items-center gap-2">
                        {searchExpanded ? (
                            <div className="flex items-center">
                                <div className="relative">
                                    <Input
                                        id="search-input"
                                        name="search"
                                        placeholder="Search..."
                                        className="h-8 w-[200px] pr-8"
                                        value={searchValue}
                                        onChange={(e) =>
                                            setSearchValue(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const form =
                                                    e.currentTarget.form;
                                                if (form) form.requestSubmit();
                                            }
                                        }}
                                    />
                                    {searchValue && (
                                        <button
                                            type="button"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            onClick={clearSearch}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleSearch}
                                    className="ml-1 h-8 w-8"
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="p-2 relative"
                                onClick={toggleSearch}
                            >
                                <Search size={18} />
                                {searchValue && (
                                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                        1
                                    </Badge>
                                )}
                            </button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button type="button" className="p-2 relative">
                                    <Filter size={18} />
                                    {selectedFilterColumn && (
                                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                            1
                                        </Badge>
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {columns.length > 0 ? (
                                    columns.map((column) => {
                                        // Extract column name from header or accessorKey
                                        const columnName =
                                            typeof column.header === "string"
                                                ? column.header
                                                : "accessorKey" in column
                                                ? String(column.accessorKey)
                                                : "Column";
                                        return (
                                            <DropdownMenuItem
                                                key={`filter-${columnName}`}
                                                onClick={() =>
                                                    handleFilterColumnSelect(
                                                        columnName
                                                    )
                                                }
                                            >
                                                {columnName}
                                            </DropdownMenuItem>
                                        );
                                    })
                                ) : (
                                    <DropdownMenuItem disabled>
                                        No columns available
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button type="button" className="p-2 relative">
                                    <ArrowUpDown size={18} />
                                    {selectedSortColumn && (
                                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                            1
                                        </Badge>
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {columns.length > 0 ? (
                                    columns.map((column) => {
                                        // Extract column name from header or accessorKey
                                        const columnName =
                                            typeof column.header === "string"
                                                ? column.header
                                                : "accessorKey" in column
                                                ? String(column.accessorKey)
                                                : "Column";
                                        return (
                                            <DropdownMenuItem
                                                key={`sort-${columnName}`}
                                                onClick={() =>
                                                    handleSortColumnSelect(
                                                        columnName
                                                    )
                                                }
                                            >
                                                {columnName}
                                            </DropdownMenuItem>
                                        );
                                    })
                                ) : (
                                    <DropdownMenuItem disabled>
                                        No columns available
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Right side - Submit and New buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="ml-2 h-10"
                            onClick={clearAll}
                        >
                            <X size={18} className="mr-1" />
                            Clear All
                        </Button>

                        <Button
                            type="submit"
                            variant="outline"
                            className="ml-2 h-10"
                        >
                            <Check size={18} className="mr-1" />
                            Apply
                        </Button>

                        <Button
                            type="button"
                            onClick={handleNewClick}
                            className="ml-2 h-10"
                        >
                            <Plus size={18} className="mr-1" />
                            New
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    );
};

export default TableFunctions;
