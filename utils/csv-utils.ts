import Papa from "papaparse";
import { processBudgetString } from "./budget-utils";
import type { InsertInventory, InsertRequirement } from "@/db/schema";

type CsvRow = Record<string, string>;
type RequirementCategory = "RISE" | "NESTSEEKERS" | "LUXURY CONCIERGE";
type InventoryStatus = "available" | "sold" | "reserved" | "rented";
type RtmOffplan = "RTM" | "OFFPLAN" | "RTM/OFFPLAN" | "NONE";

// Helper function to convert string to boolean
export const stringToBoolean = (value: string | undefined): boolean | null => {
    if (!value) return null;
    return value.toLowerCase() === "true";
};

// Helper function to convert string to number or null
export const stringToNumber = (value: string | undefined): string | null => {
    if (!value || value.trim() === "") return null;
    const numberValue = parseFloat(value);
    return isNaN(numberValue) ? null : numberValue.toString();
};

type RequirementCsvResult = Omit<InsertRequirement, "userId" | "status" | "dateCreated"> & {
    requirement_id?: string;
};

// Process requirement CSV data
export const processRequirementCsv = (file: File): Promise<RequirementCsvResult[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse<CsvRow>(file, {
            complete: (results) => {
                try {
                    const processedData = results.data.map((row) => {
                        // Validate and cast category
                        const validCategories: RequirementCategory[] = [
                            "RISE",
                            "NESTSEEKERS",
                            "LUXURY CONCIERGE",
                        ];
                        const category = validCategories.includes(
                            row.category as RequirementCategory
                        )
                            ? (row.category as RequirementCategory)
                            : "RISE";

                        // Validate RTM/Offplan
                        const validRtmOffplan: RtmOffplan[] = [
                            "RTM",
                            "OFFPLAN",
                            "RTM/OFFPLAN",
                            "NONE",
                        ];
                        const rtmOffplan = validRtmOffplan.includes(
                            row.rtm_offplan as RtmOffplan
                        )
                            ? (row.rtm_offplan as RtmOffplan)
                            : "NONE";

                        if (
                            !row.description ||
                            !row.demand ||
                            !row.preferred_type ||
                            !row.preferred_location
                        ) {
                            throw new Error(
                                "Missing required fields for requirement"
                            );
                        }

                        return {
                            description: row.description,
                            demand: row.demand,
                            preferredType: row.preferred_type,
                            preferredLocation: row.preferred_location,
                            category,
                            rtmOffplan,
                            budget: processBudgetString(row.budget),
                            phpp: stringToBoolean(row.phpp),
                            preferredSquareFootage: stringToNumber(
                                row.preferred_square_footage
                            ),
                            preferredROI: stringToNumber(row.preferred_roi),
                            call: stringToBoolean(row.call),
                            viewing: stringToBoolean(row.viewing),
                            sharedWithIndianChannelPartner: stringToBoolean(
                                row.shared_with_indian_channel_partner
                            ),
                            requirement_id: row.requirement_id,
                        };
                    });
                    resolve(processedData);
                } catch (error) {
                    reject(error);
                }
            },
            header: true,
            error: (error) => reject(error),
        });
    });
};

type InventoryCsvResult = Omit<InsertInventory, "brokerId" | "dateAdded"> & {
    inventory_id?: string;
};

// Process inventory CSV data
export const processInventoryCsv = (file: File): Promise<InventoryCsvResult[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse<CsvRow>(file, {
            complete: (results) => {
                try {
                    const processedData = results.data.map((row) => {
                        // Inventory processing
                        const validStatuses: InventoryStatus[] = [
                            "available",
                            "sold",
                            "reserved",
                            "rented",
                        ];
                        const unitStatus = validStatuses.includes(
                            row.unit_status as InventoryStatus
                        )
                            ? (row.unit_status as InventoryStatus)
                            : "available";

                        if (
                            !row.project_name ||
                            !row.property_type ||
                            !row.location
                        ) {
                            throw new Error(
                                "Missing required fields for inventory"
                            );
                        }

                        return {
                            projectName: row.project_name,
                            propertyType: row.property_type,
                            location: row.location,
                            description: row.description || "",
                            unitStatus,
                            areaSQFT: stringToNumber(row.area_sqft),
                            priceAED: processBudgetString(row.price_aed),
                            sellingPriceMillionAED: processBudgetString(
                                row.selling_price_million_aed
                            ),
                            inventory_id: row.inventory_id,
                        };
                    });
                    resolve(processedData);
                } catch (error) {
                    reject(error);
                }
            },
            header: true,
            error: (error) => reject(error),
        });
    });
};
