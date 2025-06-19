import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  try {
    // Chama o backend
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ message: data.message || "Erro ao fazer login" }, { status: 401 });
    }
    // Salva o token em cookie HTTP-only seguro
    const response = NextResponse.json({ message: "Login bem-sucedido!" });
    response.cookies.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hora
    });
    return response;
  } catch (err) {
    return NextResponse.json({ message: "Erro de conexão com o servidor" }, { status: 500 });
  }
} 