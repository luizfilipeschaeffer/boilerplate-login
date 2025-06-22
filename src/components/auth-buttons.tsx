import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AuthButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Link href="/register" passHref>
        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
          Registre-se
        </Button>
      </Link>
      <Link href="/login" passHref>
        <Button variant="outline" className="w-full sm:w-auto">
          Entrar
        </Button>
      </Link>
    </div>
  );
} 