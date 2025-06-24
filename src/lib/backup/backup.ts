import { pool } from "@/lib/db";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const resend = new Resend(process.env.RESEND_API_KEY);
const backupEmail = process.env.BACKUP_EMAIL;
const backupFilePath = path.resolve(__dirname, "./backup.sql");

async function isAutoBackupEnabled() {
  const result = await pool.query("SELECT auto_backup_enabled FROM settings WHERE id = 1");
  return result.rows[0]?.auto_backup_enabled === true;
}

async function generateBackup() {
  return new Promise<void>((resolve, reject) => {
    // Monta o comando pg_dump
    const pgUrl = process.env.POSTGRES_URL;
    if (!pgUrl) return reject("POSTGRES_URL não definida");
    // Comando para gerar o dump
    const cmd = `PGSSLMODE=require pg_dump --no-owner --no-privileges --format=plain --file=\"${backupFilePath}\" \"${pgUrl}\"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(`Erro ao gerar backup: ${stderr}`);
      } else {
        resolve();
      }
    });
  });
}

async function sendBackupEmail() {
  if (!backupEmail) throw new Error("BACKUP_EMAIL não definida no .env");
  const fileContent = fs.readFileSync(backupFilePath);
  await resend.emails.send({
    from: "backup@luizfilipeschaeffer.dev",
    to: [backupEmail],
    subject: "backup - AUTO BACKUP",
    text: "Segue em anexo o backup automático do banco de dados.",
    attachments: [
      {
        filename: "backup.sql",
        content: fileContent,
      },
    ],
  });
}

export async function runAutoBackup() {
  try {
    const enabled = await isAutoBackupEnabled();
    if (!enabled) {
      console.log("Auto backup não está habilitado.");
      return;
    }
    await generateBackup();
    await sendBackupEmail();
    console.log("Backup gerado e enviado com sucesso!");
  } catch (err) {
    console.error("Erro no auto backup:", err);
  } finally {
    await pool.end();
  }
}

// Permite rodar standalone
if (require.main === module) {
  runAutoBackup();
} 