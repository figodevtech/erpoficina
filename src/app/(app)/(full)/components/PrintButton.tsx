"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="print:hidden hover:cursor-pointer hover:text-black"
        >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
        </Button>
    );
}
