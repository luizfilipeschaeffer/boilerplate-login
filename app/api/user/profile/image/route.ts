import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }
  // Proxy multipart para backend
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const body = req.body;
  const backendRes = await fetch(`${API_URL}/api/user/profile/image`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // Não definir Content-Type para deixar o browser definir o boundary
    },
    body,
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const backendRes = await fetch(`${API_URL}/api/user/profile/image`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!backendRes.ok) {
    return NextResponse.json({ message: "Erro ao buscar imagem" }, { status: backendRes.status });
  }
  const arrayBuffer = await backendRes.arrayBuffer();
  return new NextResponse(Buffer.from(arrayBuffer), {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
} 