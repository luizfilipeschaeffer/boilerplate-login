import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import InvitationEmail from "@/components/emails/invitation-email";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "E-mail é obrigatório." }, { status: 400 });
    }

    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ message: "Um usuário com este e-mail já está cadastrado." }, { status: 409 });
    }

    const existingInvite = await pool.query("SELECT * FROM invites WHERE email = $1 AND expires_at > NOW()", [email]);
    if (existingInvite.rows.length > 0) {
        return NextResponse.json({ message: "Um convite ativo para este e-mail já foi enviado." }, { status: 409 });
    }
    
    const inviteToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 horas a partir de agora

    await pool.query(
        "INSERT INTO invites (email, token, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET token = $2, expires_at = $3, created_at = NOW(), used_at = NULL",
        [email, inviteToken, expiresAt]
    );
      
    const inviteLink = `${baseUrl}/register?token=${inviteToken}`;

    await resend.emails.send({
      from: 'Invite -Boilerplate Login <invite@luizfilipeschaefer.dev>',
      to: [email],
      subject: 'Você foi convidado para se juntar ao nosso time!',
      react: InvitationEmail({ inviteLink }),
    });

    return NextResponse.json({ message: "Convite enviado com sucesso!" }, { status: 200 });

  } catch (error) {
    console.error("Erro detalhado ao enviar convite:", JSON.stringify(error, null, 2));
    // Idealmente, aqui você notificaria sua equipe de TI via um serviço de logging/alerta.
    return NextResponse.json({ message: "Erro interno do servidor. A equipe de TI foi notificada." }, { status: 500 });
  }
} 