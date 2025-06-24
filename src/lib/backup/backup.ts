import { pool } from "@/lib/db";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const resend = new Resend(process.env.RESEND_API_KEY);
const backupEmail = process.env.BACKUP_EMAIL;

async function isAutoBackupEnabled() {
  const result = await pool.query("SELECT auto_backup_enabled FROM settings WHERE id = 1");
  return result.rows[0]?.auto_backup_enabled === true;
}

// Função para gerar backup via SQL puro (para produção)
async function generateBackupViaSQL(): Promise<string> {
  console.log('Gerando backup via SQL puro...');
  
  let backupContent = '';
  
  // Header do backup
  backupContent += `-- PostgreSQL database backup\n`;
  backupContent += `-- Generated at: ${new Date().toISOString()}\n`;
  backupContent += `-- Environment: ${process.env.NODE_ENV || 'development'}\n\n`;
  
  // Backup da tabela users
  const usersResult = await pool.query('SELECT * FROM users ORDER BY id');
  if (usersResult.rows.length > 0) {
    backupContent += `-- Backup da tabela users\n`;
    backupContent += `DELETE FROM users;\n`;
    backupContent += `INSERT INTO users (id, email, password_hash, name, role, email_verified, verification_token, reset_token, reset_token_expires, created_at, updated_at) VALUES\n`;
    
    const userValues = usersResult.rows.map((user, index) => {
      const values = [
        user.id,
        `'${user.email}'`,
        `'${user.password_hash}'`,
        user.name ? `'${user.name.replace(/'/g, "''")}'` : 'NULL',
        `'${user.role || 'user'}'`,
        user.email_verified ? 'true' : 'false',
        user.verification_token ? `'${user.verification_token}'` : 'NULL',
        user.reset_token ? `'${user.reset_token}'` : 'NULL',
        user.reset_token_expires ? `'${user.reset_token_expires.toISOString()}'` : 'NULL',
        `'${user.created_at.toISOString()}'`,
        `'${user.updated_at.toISOString()}'`
      ];
      return `(${values.join(', ')})`;
    });
    
    backupContent += userValues.join(',\n') + ';\n\n';
  }
  
  // Backup da tabela settings
  const settingsResult = await pool.query('SELECT * FROM settings ORDER BY id');
  if (settingsResult.rows.length > 0) {
    backupContent += `-- Backup da tabela settings\n`;
    backupContent += `DELETE FROM settings;\n`;
    backupContent += `INSERT INTO settings (id, auto_backup_enabled, created_at, updated_at) VALUES\n`;
    
    const settingsValues = settingsResult.rows.map((setting, index) => {
      const values = [
        setting.id,
        setting.auto_backup_enabled ? 'true' : 'false',
        `'${setting.created_at.toISOString()}'`,
        `'${setting.updated_at.toISOString()}'`
      ];
      return `(${values.join(', ')})`;
    });
    
    backupContent += settingsValues.join(',\n') + ';\n\n';
  }
  
  // Backup da tabela notifications
  const notificationsResult = await pool.query('SELECT * FROM notifications ORDER BY id');
  if (notificationsResult.rows.length > 0) {
    backupContent += `-- Backup da tabela notifications\n`;
    backupContent += `DELETE FROM notifications;\n`;
    backupContent += `INSERT INTO notifications (id, user_id, title, message, read, created_at) VALUES\n`;
    
    const notificationValues = notificationsResult.rows.map((notification, index) => {
      const values = [
        notification.id,
        notification.user_id,
        `'${notification.title.replace(/'/g, "''")}'`,
        `'${notification.message.replace(/'/g, "''")}'`,
        notification.read ? 'true' : 'false',
        `'${notification.created_at.toISOString()}'`
      ];
      return `(${values.join(', ')})`;
    });
    
    backupContent += notificationValues.join(',\n') + ';\n\n';
  }
  
  // Backup da tabela invites
  const invitesResult = await pool.query('SELECT * FROM invites ORDER BY id');
  if (invitesResult.rows.length > 0) {
    backupContent += `-- Backup da tabela invites\n`;
    backupContent += `DELETE FROM invites;\n`;
    backupContent += `INSERT INTO invites (id, email, token, expires_at, created_at) VALUES\n`;
    
    const inviteValues = invitesResult.rows.map((invite, index) => {
      const values = [
        invite.id,
        `'${invite.email}'`,
        `'${invite.token}'`,
        `'${invite.expires_at.toISOString()}'`,
        `'${invite.created_at.toISOString()}'`
      ];
      return `(${values.join(', ')})`;
    });
    
    backupContent += inviteValues.join(',\n') + ';\n\n';
  }
  
  // Backup da tabela migrations_log (se existir)
  try {
    const migrationsResult = await pool.query('SELECT * FROM migrations_log ORDER BY id');
    if (migrationsResult.rows.length > 0) {
      backupContent += `-- Backup da tabela migrations_log\n`;
      backupContent += `DELETE FROM migrations_log;\n`;
      backupContent += `INSERT INTO migrations_log (id, migration_name, executed_at) VALUES\n`;
      
      const migrationValues = migrationsResult.rows.map((migration, index) => {
        const values = [
          migration.id,
          `'${migration.migration_name}'`,
          `'${migration.executed_at.toISOString()}'`
        ];
        return `(${values.join(', ')})`;
      });
      
      backupContent += migrationValues.join(',\n') + ';\n\n';
    }
  } catch (error) {
    console.log('Tabela migrations_log não encontrada, pulando...');
  }
  
  backupContent += `-- Backup concluído\n`;
  
  return backupContent;
}

// Função para gerar backup via pg_dump (para desenvolvimento)
async function generateBackupViaPgDump(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Monta o comando pg_dump
    const pgUrl = process.env.POSTGRES_URL;
    if (!pgUrl) return reject("POSTGRES_URL não definida");
    
    // Detectar o sistema operacional para usar a sintaxe correta
    const isWindows = process.platform === 'win32';
    
    // Definir o caminho do pg_dump baseado no sistema operacional
    const pgDumpPath = isWindows 
      ? 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe'
      : 'pg_dump';
    
    // Usar um caminho mais simples para o arquivo de backup
    const backupFilePath = isWindows 
      ? path.resolve(process.cwd(), 'backup.sql')
      : path.resolve(__dirname, "./backup.sql");
    
    // Comando para gerar o dump com sintaxe compatível com Windows
    let cmd: string;
    if (isWindows) {
      // No Windows, usar a sintaxe do PowerShell com & para executar o executável
      cmd = `& '${pgDumpPath}' --no-owner --no-privileges --format=plain --file="${backupFilePath}" "${pgUrl}"`;
    } else {
      // No Linux/macOS, usar a sintaxe padrão
      cmd = `PGSSLMODE=require ${pgDumpPath} --no-owner --no-privileges --format=plain --file="${backupFilePath}" "${pgUrl}"`;
    }
    
    // Configurar as variáveis de ambiente para o processo
    const env = { ...process.env };
    if (!isWindows) {
      env.PGSSLMODE = 'require';
    }
    
    // Configurar o shell baseado no sistema operacional
    const execOptions = isWindows 
      ? { env, shell: 'powershell.exe' }
      : { env };
    
    exec(cmd, execOptions, (error, stdout, stderr) => {
      if (error) {
        // Se falhar no Windows, tentar uma segunda abordagem com SSL explícito
        if (isWindows) {
          console.log('Tentando com SSL explícito...');
          const alternativeCmd = `& '${pgDumpPath}' --no-owner --no-privileges --format=plain --file="${backupFilePath}" --sslmode=require "${pgUrl}"`;
          
          exec(alternativeCmd, execOptions, (error2, stdout2, stderr2) => {
            if (error2) {
              reject(`Erro ao gerar backup: ${stderr2}`);
            } else {
              resolve();
            }
          });
        } else {
          reject(`Erro ao gerar backup: ${stderr}`);
        }
      } else {
        resolve();
      }
    });
  });
}

// Função principal que decide qual método usar
export async function generateBackup(): Promise<string | void> {
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  
  console.log(`Ambiente detectado: ${isProduction ? 'Produção' : 'Desenvolvimento'}`);
  console.log(`Executando na Vercel: ${isVercel ? 'Sim' : 'Não'}`);
  
  // Em produção (Vercel), usar SQL puro
  if (isProduction || isVercel) {
    return await generateBackupViaSQL();
  } else {
    // Em desenvolvimento, usar pg_dump
    await generateBackupViaPgDump();
  }
}

async function sendBackupEmail(backupContent?: string) {
  if (!backupEmail) throw new Error("BACKUP_EMAIL não definida no .env");
  
  let fileContent: Buffer;
  
  if (backupContent) {
    // Backup gerado via SQL (produção)
    fileContent = Buffer.from(backupContent, 'utf8');
  } else {
    // Backup gerado via pg_dump (desenvolvimento)
    const isWindows = process.platform === 'win32';
    const backupFilePath = isWindows 
      ? path.resolve(process.cwd(), 'backup.sql')
      : path.resolve(__dirname, "./backup.sql");
    fileContent = fs.readFileSync(backupFilePath);
  }
  
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
    
    const backupResult = await generateBackup();
    await sendBackupEmail(typeof backupResult === 'string' ? backupResult : undefined);
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