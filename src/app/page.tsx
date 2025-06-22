import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, ShieldCheck, Mail, Bell } from "lucide-react";
import { Metadata } from "next";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import { cn } from "@/lib/utils";
import WordRotate from "@/components/magicui/word-rotate";
// import ScrollIndicator from "@/components/scroll-indicator";
import { AuthButtons } from "@/components/auth-buttons";
// import { RegisterNowButton } from "@/components/register-now-button";

export const metadata: Metadata = {
  title: "Boilerplate de Autenticação",
  description: "Uma solução completa e pronta para uso para sistemas de autenticação, registro e gerenciamento de usuários.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col bg-background text-foreground relative">
      {/* <ScrollIndicator sections={sections} /> */}

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative w-full h-[80vh] flex items-center justify-center text-center">
          <div className="relative z-10 container px-7 sm:px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4">
              <div className={cn(
                "group rounded-full border border-black/5 bg-neutral-900 text-base transition-all ease-in hover:cursor-pointer dark:border-white/5 animate-pulse-badge",
              )}>
                <AnimatedShinyText 
                  className="inline-flex items-center justify-center px-4 py-1 transition ease-out [--shiny-bg:theme(colors.blue.500)]"
                  textClassName="text-white"
                >
                  ✨ Apresentando um Novo Design
                </AnimatedShinyText>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none text-center">
                Sistema de Autenticação
                <WordRotate
                  words={["Moderno", "Seguro", "Rápido", "Elegante"]}
                  className="inline-block text-white bg-blue-600 rounded-md px-2"
                />
              </h1>
              <p className="max-w-[700px] text-gray-400 md:text-xl">
                Uma base sólida e elegante para sua aplicação, com tudo que você precisa para começar a desenvolver.
              </p>
              <div className="mt-6">
                <AuthButtons />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 bg-black flex justify-center">
          <div className="container px-7 sm:px-4 md:px-6 flex flex-col items-center">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Funcionalidades Essenciais</h2>
              <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed">
                Tudo pronto para você focar no que realmente importa: a lógica do seu negócio.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: ShieldCheck, title: "Autenticação Segura", description: "Login com JWT e cookies HttpOnly para máxima segurança." },
                { icon: Users, title: "Registro de Usuário", description: "Fluxo completo de registro com verificação de e-mail." },
                { icon: Mail, title: "Recuperação de Senha", description: "Processo seguro e intuitivo para redefinição de senha." },
                { icon: CheckCircle, title: "Dashboard Protegido", description: "Área administrativa acessível apenas para usuários logados." },
                { icon: Users, title: "Gerenciamento de Usuários", description: "Sistema de convites para adicionar novos membros." },
                { icon: Bell, title: "Notificações", description: "Feedback em tempo real com toasts e notificações nativas." },
              ].map((feature, i) => (
                <Card key={i} className="bg-gray-900/80 border-gray-800 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-3 text-white">
                      <feature.icon className="w-7 h-7 text-blue-400" />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20 md:py-32 flex justify-center">
          <div className="container px-7 sm:px-4 md:px-6 flex flex-col items-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-5xl mb-12 text-center">Como Funciona</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { title: "Registre-se", description: "Crie uma nova conta com seu e-mail e senha." },
                { title: "Verifique seu E-mail", description: "Clique no link de verificação enviado para sua caixa de entrada." },
                { title: "Faça o Login", description: "Acesse a plataforma com suas novas credenciais." },
                { title: "Explore", description: "Navegue pelo dashboard e descubra as funcionalidades." },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">{i + 1}</div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="w-full py-20 md:py-32 flex justify-center">
          <div className="container px-7 sm:px-4 md:px-6 flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Pronto para Começar?</h2>
            <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed mt-4">
              Crie sua conta gratuitamente e explore a plataforma. A jornada para um desenvolvimento ágil começa aqui.
            </p>
            <div className="mt-8">
              {/* <RegisterNowButton /> */}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 w-full text-center border-t border-gray-800">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Boilerplate Auth. Feito com ❤️.</p>
      </footer>
    </div>
  );
}
