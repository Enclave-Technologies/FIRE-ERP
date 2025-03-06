import React from "react";

interface SummaryComponentProps {
    data: {
        newRequirements: number;
        inventoryChanges: number;
        recentDeals: number;
    };
}

const SummaryComponent: React.FC<SummaryComponentProps> = ({
    data = {
        newRequirements: 0,
        inventoryChanges: 0,
        recentDeals: 0,
    },
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-medium text-blue-800">
                    New Requirements
                </h3>
                <div className="mt-2 flex items-center">
                    <span className="text-3xl font-bold text-blue-600">
                        {data.newRequirements}
                    </span>
                    <span className="ml-2 text-sm text-blue-500">
                        this month
                    </span>
                </div>
                <p className="mt-2 text-sm text-blue-600">
                    {data.newRequirements > 10
                        ? "High activity"
                        : "Normal activity"}
                </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-medium text-green-800">
                    Inventory Changes
                </h3>
                <div className="mt-2 flex items-center">
                    <span className="text-3xl font-bold text-green-600">
                        {data.inventoryChanges}
                    </span>
                    <span className="ml-2 text-sm text-green-500">
                        new listings
                    </span>
                </div>
                <p className="mt-2 text-sm text-green-600">
                    {data.inventoryChanges > 5
                        ? "Growing inventory"
                        : "Stable inventory"}
                </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-medium text-purple-800">
                    Recent Deals
                </h3>
                <div className="mt-2 flex items-center">
                    <span className="text-3xl font-bold text-purple-600">
                        {data.recentDeals}
                    </span>
                    <span className="ml-2 text-sm text-purple-500">
                        closed deals
                    </span>
                </div>
                <p className="mt-2 text-sm text-purple-600">
                    {data.recentDeals > 3
                        ? "Strong performance"
                        : "Average performance"}
                </p>
            </div>
        </div>
    );
};

export default SummaryComponent;
