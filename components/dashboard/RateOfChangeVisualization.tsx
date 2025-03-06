import React from "react";

// This component would typically use a charting library like Chart.js, Recharts, or D3.js
// For now, we'll create a simple visual representation
interface RateOfChangeVisualizationProps {
    data: {
        months: string[];
        requirements: number[];
        inventory: number[];
    };
}

const RateOfChangeVisualization: React.FC<RateOfChangeVisualizationProps> = ({
    data = {
        months: [],
        requirements: [],
        inventory: [],
    },
}) => {
    // If no data is provided, show a loading state or empty state
    if (data.months.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data available</p>
            </div>
        );
    }

    // Calculate the max value for scaling
    const maxValue = Math.max(...data.requirements, ...data.inventory);

    return (
        <div className="w-full">
            <div className="flex justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm">Requirements</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Inventory</span>
                </div>
            </div>

            <div className="flex h-[150px] items-end space-x-2">
                {data.months.map((month: string, index: number) => (
                    <div
                        key={month}
                        className="flex-1 flex flex-col items-center"
                    >
                        <div className="w-full flex justify-center space-x-1">
                            <div
                                className="w-3 bg-blue-500 rounded-t"
                                style={{
                                    height: `${
                                        (data.requirements[index] / maxValue) *
                                        100
                                    }%`,
                                }}
                            ></div>
                            <div
                                className="w-3 bg-green-500 rounded-t"
                                style={{
                                    height: `${
                                        (data.inventory[index] / maxValue) * 100
                                    }%`,
                                }}
                            ></div>
                        </div>
                        <div className="text-xs mt-2">{month}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RateOfChangeVisualization;
