"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IMaskInput } from "react-imask"

const genderOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "outro", label: "Outro" },
]

function Alert({ type, children }: { type: "success" | "error", children: React.ReactNode }) {
  return (
    <div className={`rounded px-4 py-2 mb-2 text-center ${type === "success" ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"}`}>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const [form, setForm] = useState({
    nickname: "",
    nome: "",
    sobrenome: "",
    email: "",
    email_recuperacao: "",
    telefone: "",
    cpf: "",
    birth_date: "",
    gender: "",
    profile_image: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaMsg, setSenhaMsg] = useState<string | null>(null);
  const [senhaLoading, setSenhaLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  useEffect(() => {
    async function fetchProfile() {
      setLoadingProfile(true);
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (res.ok) {
          setForm({
            nickname: data.nickname || "",
            nome: data.nome || "",
            sobrenome: data.sobrenome || "",
            email: data.email || "",
            email_recuperacao: data.email_recuperacao || "",
            telefone: data.telefone || "",
            cpf: data.cpf || "",
            birth_date: data.birth_date ? data.birth_date.slice(0, 10) : "",
            gender: data.gender || "",
            profile_image: "",
          });
        } else {
          setError(data.message || "Erro ao carregar perfil");
        }
      } catch {
        setError("Erro de conexão ao carregar perfil");
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchProfileImage() {
      try {
        const res = await fetch("/api/user/profile/image");
        if (res.ok) {
          const blob = await res.blob();
          setProfileImageUrl(URL.createObjectURL(blob));
        } else {
          setProfileImageUrl("");
        }
      } catch {
        setProfileImageUrl("");
      }
    }
    fetchProfileImage();
  }, [uploading]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.email_recuperacao && form.email_recuperacao === form.email) {
      setError("O email de recuperação deve ser diferente do email principal.");
      return;
    }
    setLoading(true);
    try {
      // Chama a API interna (precisa garantir que o token está no cookie)
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erro ao atualizar perfil");
        setLoading(false);
        return;
      }
      setSuccess("Perfil atualizado com sucesso!");
    } catch {
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/user/profile/image", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Imagem enviada com sucesso!");
      } else {
        setError(data.message || "Falha ao enviar imagem");
      }
    } catch {
      setError("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSenhaMsg(null);
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setSenhaMsg("Preencha todos os campos.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setSenhaMsg("A nova senha e a confirmação não coincidem.");
      return;
    }
    setSenhaLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSenhaMsg(data.message || "Erro ao atualizar senha.");
      } else {
        setSenhaMsg("Senha atualizada com sucesso!");
        setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
      }
    } catch {
      setSenhaMsg("Erro de conexão com o servidor.");
    }
    setSenhaLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
      </div>

      {loadingProfile ? (
        <div className="text-center py-10">Carregando perfil...</div>
      ) : (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Foto do Perfil</CardTitle>
            <CardDescription>Atualize sua foto de perfil</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileImageUrl || "/placeholder.svg?height=80&width=80"} alt="Foto do perfil" />
              <AvatarFallback>{form.nome?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <span className="text-xs text-gray-500">Enviando imagem...</span>}
            {form.profile_image && <span className="text-xs text-green-700">Imagem salva!</span>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <Alert type="error">{error}</Alert>}
              {success && <Alert type="success">{success}</Alert>}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input id="nickname" name="nickname" value={form.nickname} onChange={handleChange} placeholder="Seu apelido único" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sobrenome">Sobrenome</Label>
                  <Input id="sobrenome" name="sobrenome" value={form.sobrenome} onChange={handleChange} placeholder="Seu sobrenome" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" disabled />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email_recuperacao">Email de Recuperação</Label>
                  <Input id="email_recuperacao" name="email_recuperacao" type="email" value={form.email_recuperacao} onChange={handleChange} placeholder="email alternativo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone (formato internacional)</Label>
                  <IMaskInput
                    mask="+00 00 00000-0000"
                    id="telefone"
                    name="telefone"
                    value={form.telefone}
                    onAccept={(value) => handleChange({ target: { name: 'telefone', value } } as React.ChangeEvent<HTMLInputElement>)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="+55 11 91234-5678"
                    unmask={false}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <IMaskInput
                    mask="000.000.000-00"
                    id="cpf"
                    name="cpf"
                    value={form.cpf}
                    onAccept={(value) => handleChange({ target: { name: 'cpf', value } } as React.ChangeEvent<HTMLInputElement>)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="123.456.789-00"
                    unmask={false}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input id="birth_date" name="birth_date" type="date" value={form.birth_date} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <select id="gender" name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded px-2 py-2">
                  <option value="">Selecione</option>
                  {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>{loading ? <span className="animate-spin mr-2">⏳</span> : null}{loading ? "Salvando..." : "Salvar Alterações"}</Button>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>Atualize sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 md:p-6 border rounded bg-white w-full md:max-w-md md:ml-0 md:mr-auto">
              <h3 className="font-semibold text-lg mb-4">Alterar Senha</h3>
              <form onSubmit={handleChangePassword} className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="senha-atual">Senha atual</label>
                  <input id="senha-atual" type="password" className="w-full border rounded px-3 py-2" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="nova-senha">Nova senha</label>
                  <input id="nova-senha" type="password" className="w-full border rounded px-3 py-2" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="confirmar-senha">Confirmar nova senha</label>
                  <input id="confirmar-senha" type="password" className="w-full border rounded px-3 py-2" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required />
                </div>
                {senhaMsg && <div className={`text-sm text-center ${senhaMsg.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{senhaMsg}</div>}
                <button type="submit" className="bg-black text-white rounded px-4 py-2 hover:bg-gray-800 transition" disabled={senhaLoading}>
                  {senhaLoading ? "Salvando..." : "Alterar Senha"}
                </button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  )
}
