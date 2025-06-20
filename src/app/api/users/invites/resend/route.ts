import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import InvitationEmail from "@/components/emails/invitation-email";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const { id: inviteId } = await req.json();

    if (!inviteId) {
      return NextResponse.json({ message: "O ID do convite é obrigatório." }, { status: 400 });
    }

    const inviteResult = await pool.query("SELECT * FROM invites WHERE id = $1 AND used_at IS NULL", [inviteId]);
    if (inviteResult.rows.length === 0) {
      return NextResponse.json({ message: "Convite não encontrado ou já utilizado." }, { status: 404 });
    }

    const invite = inviteResult.rows[0];
    const { email } = invite;
    
    const newInviteToken = randomBytes(32).toString("hex");
    const newExpiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 horas a partir de agora

    await pool.query(
        "UPDATE invites SET token = $1, expires_at = $2, created_at = NOW() WHERE id = $3",
        [newInviteToken, newExpiresAt, inviteId]
    );
      
    const inviteLink = `${baseUrl}/register?token=${newInviteToken}`;

    await resend.emails.send({
      from: 'Invite - Boilerplate Login <invite@luizfilipeschaeffer.dev>',
      to: [email],
      subject: 'Convite Reenviado: Junte-se ao nosso time!',
      react: InvitationEmail({ inviteLink }),
    });

    return NextResponse.json({ message: "Convite reenviado com sucesso!" }, { status: 200 });

  } catch (error) {
    console.error("Erro ao reenviar convite:", JSON.stringify(error, null, 2));
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
} 