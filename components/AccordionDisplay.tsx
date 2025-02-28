import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import type { AccordionProps } from "@/types";
import { ChevronUp } from "lucide-react";

export function AccordionIcons(props: AccordionProps) {
    return (
        <Accordion
            className="flex w-full flex-col divide-y divide-zinc-200 dark:divide-zinc-700"
            transition={{ duration: 0.2, ease: "easeInOut" }}
        >
            {props.items.map((item) => (
                <AccordionItem
                    key={item.title}
                    value={item.title} // or item.id if available
                    className="py-2"
                >
                    <AccordionTrigger className="w-full text-left text-zinc-950 dark:text-zinc-50">
                        <div className="flex items-center justify-between">
                            <div>{item.title}</div>
                            <ChevronUp className="h-4 w-4 text-zinc-950 transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>{item.content}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
