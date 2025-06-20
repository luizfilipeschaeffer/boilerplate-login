"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IMaskInput } from "react-imask"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

const genderOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "outro", label: "Outro" },
]

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
  });
  const [passwordForm, setPasswordForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: ""
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          });
        } else {
          toast.error(data.message || "Erro ao carregar perfil");
        }
      } catch {
        toast.error("Erro de conexão ao carregar perfil");
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
          const data = await res.json();
          setProfileImageUrl(data.imageUrl);
        }
      } catch {
        setProfileImageUrl("");
      }
    }
    fetchProfileImage();
  }, [uploading]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handlePasswordChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const requiredFields = ['nickname', 'nome', 'sobrenome', 'email_recuperacao', 'telefone', 'cpf', 'birth_date', 'gender'];
    for (const field of requiredFields) {
      if (!form[field as keyof typeof form]) {
        toast.error(`O campo ${field.replace('_', ' de ')} é obrigatório.`);
        setLoading(false);
        return;
      }
    }

    const digitosTelefone = form.telefone.replace(/\D/g, '');
    const digitosCpf = form.cpf.replace(/\D/g, '');

    if (digitosTelefone.length < 10) {
      toast.error("O campo Telefone está incompleto.");
      setLoading(false);
      return;
    }

    if (digitosCpf.length !== 11) {
      toast.error("O campo CPF está incompleto. Deve conter 11 dígitos.");
      setLoading(false);
      return;
    }

    if (form.email_recuperacao === form.email) {
      toast.error("O email de recuperação deve ser diferente do email principal.");
      setLoading(false);
      return;
    }

    try {
      const profileRes = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (profileRes.ok) {
        toast.success("Perfil atualizado com sucesso!");
      } else {
        const data = await profileRes.json();
        toast.error(data.message || "Erro ao atualizar perfil.");
      }
    } catch {
      toast.error("Erro de conexão ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  }
  
  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordLoading(true);

    if (!passwordForm.senhaAtual || !passwordForm.novaSenha || !passwordForm.confirmarSenha) {
      toast.error("Preencha todos os campos de senha.");
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.novaSenha !== passwordForm.confirmarSenha) {
      toast.error("A nova senha e a confirmação não coincidem.");
      setPasswordLoading(false);
      return;
    }

    try {
      const passwordRes = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha_atual: passwordForm.senhaAtual, nova_senha: passwordForm.novaSenha }),
      });
      if (passwordRes.ok) {
        setPasswordForm({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
        setIsModalOpen(false);
        toast.success("Senha alterada com sucesso!");
      } else {
        const data = await passwordRes.json();
        toast.error(data.message || "Erro ao atualizar senha.");
      }
    } catch {
      toast.error("Erro de conexão ao atualizar senha.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tipo de arquivo
    if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione um arquivo de imagem válido.");
        return;
    }

    // Validação de dimensões da imagem
    const image = new Image();
    const reader = new FileReader();
    
    reader.onload = (event) => {
        if (event.target?.result) {
            image.src = event.target.result as string;
        }
    };

    image.onload = async () => {
        if (image.width > 1000 || image.height > 1000) {
            toast.error("A imagem não pode ter mais de 1000px de largura ou altura.");
            e.target.value = ""; // Limpa a seleção do input
            return;
        }

        // Se a validação passar, continua com o upload
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/user/profile/image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao fazer upload da imagem.');
            }
          
            const data = await response.json();
          
            setProfileImageUrl(data.imageUrl);
            toast.success("Imagem do perfil atualizada com sucesso!");

        } catch (error) {
            toast.error((error as Error).message || "Erro ao enviar imagem.");
        } finally {
            setUploading(false);
            e.target.value = ""; // Limpa a seleção do input
        }
    };

    image.onerror = () => {
        toast.error("Não foi possível carregar a imagem para validação.");
    };
    
    reader.readAsDataURL(file);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
      </div>

      {loadingProfile ? (
        <div className="text-center py-10">Carregando perfil...</div>
      ) : (
      <form onSubmit={handleUpdateProfile}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Coluna 1: Foto */}
          <div className="lg:w-1/3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Foto do Perfil</CardTitle>
                <CardDescription>Atualize sua foto de perfil</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImageUrl || '/placeholder.svg'} alt="Foto do perfil" />
                  <AvatarFallback>{form.nickname ? form.nickname.slice(0, 2).toUpperCase() : "U"}</AvatarFallback>
                </Avatar>
                <Button asChild variant="outline">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {uploading ? "Enviando..." : "Escolher Foto"}
                    <Input id="image-upload" type="file" className="sr-only" onChange={handleImageUpload} disabled={uploading} accept="image/*"/>
                  </label>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Coluna 2: Informações Pessoais */}
          <div className="lg:w-2/3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Nickname</Label>
                      <Input id="nickname" name="nickname" value={form.nickname} onChange={handleChange} placeholder="Seu apelido único" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sobrenome">Sobrenome</Label>
                      <Input id="sobrenome" name="sobrenome" value={form.sobrenome} onChange={handleChange} placeholder="Seu sobrenome" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email_recuperacao">Email de Recuperação</Label>
                      <Input id="email_recuperacao" name="email_recuperacao" type="email" value={form.email_recuperacao} onChange={handleChange} placeholder="email alternativo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <IMaskInput
                        mask="000.000.000-00"
                        id="cpf"
                        name="cpf"
                        value={form.cpf}
                        onAccept={(value: string) => handleChange({ target: { name: "cpf", value } } as ChangeEvent<HTMLInputElement>)}
                        placeholder="123.456.789-00"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input id="nome" name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" value={form.email} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <IMaskInput
                        mask="+{55} (00) 00000-0000"
                        id="telefone"
                        name="telefone"
                        value={form.telefone}
                        onAccept={(value: string) => handleChange({ target: { name: "telefone", value } } as ChangeEvent<HTMLInputElement>)}
                        placeholder="+55 (11) 91234-5678"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="birth_date">Data de Nascimento</Label>
                      <Input id="birth_date" name="birth_date" type="date" value={form.birth_date} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                 <div className="space-y-2 mt-4">
                  <Label htmlFor="gender">Gênero</Label>
                  <select id="gender" name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded px-2 py-2 bg-background text-foreground">
                    <option value="">Selecione</option>
                    {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">Redefinir Senha</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar Senha</DialogTitle>
                <DialogDescription>
                  Atualize sua senha de acesso. Preencha os campos abaixo.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senhaAtual">Senha atual</Label>
                  <Input id="senhaAtual" name="senhaAtual" type="password" value={passwordForm.senhaAtual} onChange={handlePasswordChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova senha</Label>
                  <Input id="novaSenha" name="novaSenha" type="password" value={passwordForm.novaSenha} onChange={handlePasswordChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
                  <Input id="confirmarSenha" name="confirmarSenha" type="password" value={passwordForm.confirmarSenha} onChange={handlePasswordChange} required />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? "Salvando..." : "Salvar Senha"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}
