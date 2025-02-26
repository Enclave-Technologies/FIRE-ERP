import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
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
                    value="getting-started"
                    className="py-2"
                >
                    <AccordionTrigger className="w-full text-left text-zinc-950 dark:text-zinc-50">
                        <div className="flex items-center justify-between">
                            <div>{item.title}</div>
                            <ChevronUp className="h-4 w-4 text-zinc-950 transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        {/* <p className="text-zinc-500 dark:text-zinc-400">
                        Discover the fundamental concepts of Motion-Primitives.
                        This section guides you through the installation process
                        and provides an overview of how to integrate these
                        components into your projects. Learn about the core
                        functionalities and how to set up your first animation
                        effectively.
                    </p> */}
                        {item.content}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
