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

type RequirementCsvResult = Omit<
    InsertRequirement,
    "userId" | "status" | "dateCreated"
> & {
    requirement_id?: string;
};

// Process requirement CSV data
export const processRequirementCsv = (
    file: File
): Promise<RequirementCsvResult[]> => {
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
                            requirement_id: row.requirement_id,
                            userId: row.user_id,
                            description: row.description,
                            dateCreated: row.date_created,
                            demand: row.demand,
                            preferredType: row.preferred_type,
                            preferredLocation: row.preferred_location,
                            budget: processBudgetString(row.budget),
                            phpp: stringToBoolean(row.phpp),
                            preferredSquareFootage: stringToNumber(
                                row.preferred_square_footage
                            ),
                            preferredROI: stringToNumber(row.preferred_roi),
                            sharedWithIndianChannelPartner: stringToBoolean(
                                row.shared_with_indian_channel_partner
                            ),
                            call: stringToBoolean(row.call),
                            viewing: stringToBoolean(row.viewing),
                            category,
                            remarks: row.remarks,
                            rtmOffplan,
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
export const processInventoryCsv = (
    file: File
): Promise<InventoryCsvResult[]> => {
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
                            inventory_id: row.inventory_id,
                            brokerId: row.broker_id,
                            sn: row.sn,
                            propertyType: row.property_type,
                            projectName: row.project_name,
                            description: row.description || "",
                            location: row.location,
                            unitNumber: row.unit_number,
                            bedRooms: parseInt(row.bed_rooms) || 0,
                            maidsRoom: parseInt(row.maids_room) || 0,
                            studyRoom: parseInt(row.study_room) || 0,
                            carPark: parseInt(row.car_park) || 0,
                            areaSQFT: stringToNumber(row.area_sqft),
                            buSQFT: stringToNumber(row.bua_sqft),
                            sellingPriceMillionAED: processBudgetString(
                                row.selling_price_million_aed
                            ),
                            unitStatus,
                            completionDate: new Date(row.completion_date),
                            priceAED: processBudgetString(row.price_aed),
                            inrCr: processBudgetString(row.inr_cr),
                            rentApprox: processBudgetString(row.rent_approx),
                            roiGross: stringToNumber(row.roi_gross),
                            markup: processBudgetString(row.markup),
                            brokerage: processBudgetString(row.brokerage),
                            remarks: row.remarks,
                            bayut: row.bayut,
                            phppEligible: stringToBoolean(row.phpp_eligible),
                            phppDetails: row.phpp_details,
                            propertyFinder: row.property_finder,
                            dateAdded: row.date_added
                                ? new Date(row.date_added)
                                : new Date(),
                            updatedAt: row.updated_at
                                ? new Date(row.updated_at)
                                : new Date(),
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
