import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface RequirementsTableProps {
    requirements: {
        requirements: {
            requirementId: string;
            dateCreated: Date;
            preferredType: string;
            preferredLocation: string;
            // Include other properties that might be used
            userId?: string;
            description?: string;
            demand?: string;
            budget?: string;
            rtmOffplan?: string | null;
            remarks?: string | null;
        };
        deals: {
            dealId: string;
            status?: string | null;
            // Include other properties that might be used
            createdAt?: Date;
            updatedAt?: Date;
            requirementId?: string | null;
            remarks?: string | null;
            paymentPlan?: string | null;
            outstandingAmount?: string | null;
            milestones?: string | null;
            inventoryId?: string | null;
        } | null;
    }[];
}

const RequirementsTable: React.FC<RequirementsTableProps> = ({
    requirements,
}) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {requirements.map((item) => (
                    <TableRow key={item.requirements.requirementId}>
                        <TableCell>
                            {new Date(
                                item.requirements.dateCreated
                            ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{item.requirements.preferredType}</TableCell>
                        <TableCell>
                            {item.requirements.preferredLocation}
                        </TableCell>
                        <TableCell>
                            <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                    item.deals
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                }`}
                            >
                                {item.deals ? "In Deal" : "Open"}
                            </span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default RequirementsTable;
