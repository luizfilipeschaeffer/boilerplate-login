export default function EnvSetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body style={{ background: '#f7f7f7', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
} 