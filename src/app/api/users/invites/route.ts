import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const invitesResult = await pool.query(
      "SELECT id, email, expires_at, created_at FROM invites WHERE used_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC"
    );

    return NextResponse.json(invitesResult.rows);
  } catch (error) {
    console.error("Erro ao buscar convites:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "O ID do convite é obrigatório." }, { status: 400 });
    }

    const deleteResult = await pool.query("DELETE FROM invites WHERE id = $1", [id]);

    if (deleteResult.rowCount === 0) {
      return NextResponse.json({ message: "Convite não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ message: "Convite removido com sucesso." }, { status: 200 });

  } catch (error) {
    console.error("Erro ao remover convite:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
} 