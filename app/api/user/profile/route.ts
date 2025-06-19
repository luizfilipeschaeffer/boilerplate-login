import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Lê o cookie 'token' do request
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  // Faz proxy para o backend, repassando o token no header Authorization
  const backendRes = await fetch("http://localhost:5000/api/user/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }
  const body = await req.json();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const backendRes = await fetch(`${API_URL}/api/user/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
} 