import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Página não encontrada</h2>
      <p className="text-gray-500 mb-6">A página que você procura não existe ou foi movida.</p>
      <Link href="/" className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition">Voltar para o início</Link>
    </div>
  );
} 