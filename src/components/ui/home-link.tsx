"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import { ConfirmationDialog } from "./confirmation-dialog";
import { Button } from "./button";

interface HomeLinkProps {
  isFormDirty: boolean;
}

export function HomeLink({ isFormDirty }: HomeLinkProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isFormDirty) {
      e.preventDefault();
      setIsDialogOpen(true);
    }
  };

  const handleConfirm = () => {
    router.push("/");
  };

  return (
    <>
      <Link href="/" onClick={handleLinkClick} className="absolute top-4 left-4">
        <Button variant="ghost" size="icon">
          <Home className="h-6 w-6" />
        </Button>
      </Link>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirm}
        title="Descartar alterações?"
        description="Você tem certeza de que deseja sair? Suas alterações não salvas serão perdidas."
      />
    </>
  );
} 