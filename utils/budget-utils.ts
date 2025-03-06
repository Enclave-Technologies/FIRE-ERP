/**
 * Utility functions for handling budget values
 */

/**
 * Parses a budget value string like "900K" to "900000" or "1.2M" to "1200000"
 * @param value The budget value string to parse
 * @returns The parsed numeric string
 */
export const parseBudgetValue = (value: string): string => {
    // Remove any commas and spaces
    value = value.replace(/,|\s/g, "");

    // Handle K/M suffixes
    if (value.toUpperCase().includes("K")) {
        const num = parseFloat(value.toUpperCase().replace("K", ""));
        return (num * 1000).toString();
    } else if (value.toUpperCase().includes("M")) {
        const num = parseFloat(value.toUpperCase().replace("M", ""));
        return (num * 1000000).toString();
    } else if (value.toUpperCase().includes("CR")) {
        const num = parseFloat(value.toUpperCase().replace("CR", ""));
        return (num * 10000000).toString();
    }

    return value;
};

/**
 * Formats a budget string for display with commas
 * @param budget The budget string to format
 * @returns The formatted budget string with commas
 */
export const formatBudgetForDisplay = (budget: string): string => {
    if (!budget) return "";

    // Handle range format (e.g., "900000-1000000")
    if (budget.includes("-")) {
        const parts = budget.split("-");
        const formattedParts = parts.map((part) => {
            const num = parseFloat(part.trim().replace(/[^0-9.]/g, ""));
            return !isNaN(num)
                ? new Intl.NumberFormat("en-US").format(num)
                : part.trim();
        });
        return formattedParts.join(" - ");
    }
    // Handle single value
    else {
        const num = parseFloat(budget.replace(/[^0-9.]/g, ""));
        return !isNaN(num)
            ? new Intl.NumberFormat("en-US").format(num)
            : budget;
    }
};

/**
 * Processes a budget string by parsing any shorthand notations and formatting ranges
 * @param budget The budget string to process
 * @returns The processed budget string
 */
export const processBudgetString = (budget: string): string => {
    if (!budget) return "";

    if (budget.includes("-")) {
        const parts = budget.split("-");
        const parsedParts = parts.map((part) => parseBudgetValue(part.trim()));
        return parsedParts.join("-");
    } else {
        return parseBudgetValue(budget);
    }
};
