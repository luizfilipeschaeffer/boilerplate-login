"use client"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const genderOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "outro", label: "Outro" },
]

export default function RegisterPage() {
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
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [emailDomain, setEmailDomain] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function getEmailProviderUrl(email: string) {
    if (email.endsWith("@gmail.com")) return "https://mail.google.com";
    if (email.endsWith("@yahoo.com") || email.endsWith("@yahoo.com.br")) return "https://mail.yahoo.com";
    if (email.endsWith("@outlook.com") || email.endsWith("@hotmail.com")) return "https://outlook.live.com";
    return null;
  }

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.nickname || !form.email || !form.password || !form.confirmPassword) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (form.email_recuperacao && form.email_recuperacao === form.email) {
      setError("O email de recuperação deve ser diferente do email principal.");
      return;
    }
    setStep(2);
  }

  function handlePreviousStep(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setError("");
    setStep(1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShowVerify(false);

    const digitosCpf = form.cpf.replace(/\D/g, '');
    if (digitosCpf.length !== 11) {
      setError("CPF inválido. Deve conter 11 dígitos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: form.nickname,
          nome: form.nome,
          sobrenome: form.sobrenome,
          email: form.email,
          email_recuperacao: form.email_recuperacao,
          telefone: form.telefone,
          cpf: form.cpf,
          birth_date: form.birth_date,
          gender: form.gender,
          password: form.password
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erro ao criar conta");
        setLoading(false);
        return;
      }
      setShowVerify(true);
      const providerUrl = getEmailProviderUrl(form.email);
      setEmailDomain(providerUrl);
    } catch {
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  const inputStyles = "bg-gray-900/50 border-gray-700 text-white";
  const selectStyles = `${inputStyles} block w-full rounded-md border p-2 text-white`;

  return (
    <div className="w-full max-w-md bg-black/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 text-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Criar Conta</h1>
        <p className="text-gray-400">Preencha os dados abaixo para criar sua conta</p>
      </div>

      {showVerify ? (
        <div className="space-y-4 text-center">
          <div className="text-green-400 font-semibold">Conta criada!<br />Enviamos um link de verificação para <b>{form.email}</b>.<br />Acesse seu e-mail e clique no link para ativar sua conta.</div>
          {emailDomain && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
              <a href={emailDomain} target="_blank" rel="noopener noreferrer">
                Ir para minha caixa de entrada
              </a>
            </Button>
          )}
          <Button className="w-full" variant="secondary" onClick={() => router.push("/login")}>Ir para o Login</Button>
        </div>
      ) : step === 1 ? (
        <form className="space-y-4" onSubmit={handleNextStep}>
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input id="nickname" name="nickname" required value={form.nickname} onChange={handleChange} placeholder="Seu apelido único" className={inputStyles} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="seu@email.com" className={inputStyles} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email_recuperacao">Email de Recuperação</Label>
            <Input id="email_recuperacao" name="email_recuperacao" type="email" value={form.email_recuperacao} onChange={handleChange} placeholder="email alternativo" className={inputStyles} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone (formato internacional)</Label>
            <Input id="telefone" name="telefone" value={form.telefone} onChange={handleChange} placeholder="+55 11 91234-5678" className={inputStyles} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required value={form.password} onChange={handleChange} className={inputStyles} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange} className={inputStyles} />
          </div>
          {error && <div className="text-red-500 text-sm text-center pt-2">{error}</div>}
          <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={loading}>
            Próxima Etapa
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" required value={form.nome} onChange={handleChange} placeholder="Seu nome" className={inputStyles} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sobrenome">Sobrenome</Label>
            <Input id="sobrenome" name="sobrenome" value={form.sobrenome} onChange={handleChange} placeholder="Seu sobrenome" className={inputStyles} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" name="cpf" value={form.cpf} onChange={handleChange} placeholder="123.456.789-00" className={inputStyles} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Input id="birth_date" name="birth_date" type="date" required value={form.birth_date} onChange={handleChange} className={inputStyles} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gênero</Label>
            <select id="gender" name="gender" required value={form.gender} onChange={handleChange} className={selectStyles}>
              <option value="">Selecione</option>
              {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          {error && <div className="text-red-500 text-sm text-center pt-2">{error}</div>}
          <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={loading}>
            {loading ? "Criando..." : "Registrar"}
          </Button>
          <Button className="w-full" variant="secondary" type="button" onClick={(e) => handlePreviousStep(e)}>
            Voltar
          </Button>
        </form>
      )}
      <div className="text-center text-sm mt-6 text-gray-300">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-blue-400 hover:underline">
          Entrar
        </Link>
      </div>
    </div>
  )
}
