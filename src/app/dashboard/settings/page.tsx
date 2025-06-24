"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [autoBackup, setAutoBackup] = useState(false);
  const [backupEmail, setBackupEmail] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setAutoBackup(data.auto_backup_enabled || false);
      }
    } catch (e) {
      console.error("Erro ao carregar configurações:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleBackup() {
    setDownloading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/backup", { method: "POST" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao gerar backup");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup.sql";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSuccess("Backup gerado e baixado com sucesso!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar backup");
    } finally {
      setDownloading(false);
    }
  }

  async function handleAutoBackupChange(checked: boolean) {
    setAutoBackup(checked);
    await saveSettings(checked, backupEmail);
  }

  async function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const email = e.target.value;
    setBackupEmail(email);
    await saveSettings(autoBackup, email);
  }

  async function saveSettings(autoBackupEnabled: boolean, email: string) {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auto_backup_enabled: autoBackupEnabled,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao salvar configurações");
      }
      
      setSuccess("Configurações salvas com sucesso!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold mb-4">Ajustes</h1>
        <div className="text-muted-foreground">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">Ajustes</h1>
      <Tabs defaultValue="backup" className="w-full">
        <TabsList>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          {/* Outras abas podem ser adicionadas aqui futuramente */}
        </TabsList>
        <TabsContent value="backup">
          <div className="flex flex-col gap-4">
            <div>
              <Button onClick={handleBackup} disabled={downloading}>
                {downloading ? "Gerando..." : "Executar backup manualmente"}
              </Button>
              {success && <div className="text-green-600 mt-2">{success}</div>}
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={autoBackup} 
                onCheckedChange={handleAutoBackupChange}
                disabled={saving}
              />
              <Label>Backup automático</Label>
            </div>
            <div>
              <Label className="block mb-1 font-medium">E-mail de destino do backup</Label>
              <Input
                type="email"
                value={backupEmail}
                onChange={handleEmailChange}
                placeholder="Adicionar e-mail"
                disabled={saving}
              />
            </div>
            <div className="mt-6">
              <h2 className="font-semibold mb-2">Backups disponíveis</h2>
              {/* Espaço reservado para exibir/manipular dados de backup (lista, botões, etc) */}
              <div className="border rounded p-4 text-muted-foreground text-sm">
                Nenhum backup listado ainda.
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 