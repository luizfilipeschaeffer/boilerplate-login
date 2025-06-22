"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mt-8 items-center justify-center">
            <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                <Link href="/register">
                    Registrar-se agora
                </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-gray-600 hover:bg-gray-800 text-white">
                 <Link href="/login">
                    Entrar
                </Link>
            </Button>
        </div>
    );
} 