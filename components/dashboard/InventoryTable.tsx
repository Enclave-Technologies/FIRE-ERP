import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface DealsTableProps {
    deals: {
        deal: {
            dealId: string;
            updatedAt: Date;
            status: "open" | "assigned" | "negotiation" | "closed" | "rejected" | null;
        };
        requirement: {
            demand: string;
        };
    }[];
}

const DealsTable: React.FC<DealsTableProps> = ({ deals }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {deals.map((item) => (
                    <TableRow key={item.deal.dealId}>
                        <TableCell>
                            {new Date(item.deal.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{item.requirement.demand}</TableCell>
                        <TableCell>
                            <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                    item.deal.status === "closed"
                                        ? "bg-green-100 text-green-800"
                                        : item.deal.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : item.deal.status === "negotiation"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800"
                                }`}
                            >
                                {item.deal.status
                                    ? item.deal.status.charAt(0).toUpperCase() +
                                      item.deal.status.slice(1)
                                    : "Unknown"}
                            </span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default DealsTable;
