"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RegisterNowButton() {
    const router = useRouter();

    return (
        <Button onClick={() => router.push('/register')} size="lg" className="bg-white text-black hover:bg-gray-200">
            Registrar Agora
        </Button>
    );
} 