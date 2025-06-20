import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PasswordChangedEmailProps {
  userNickname?: string;
}

export const PasswordChangedEmail = ({
  userNickname = 'Usuário',
}: PasswordChangedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Sua senha foi alterada</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Alerta de Segurança</Heading>
          <Section style={section}>
            <Text style={text}>Olá, {userNickname},</Text>
            <Text style={text}>
              Estamos entrando em contato para informar que a senha da sua conta foi alterada com sucesso.
            </Text>
            <Text style={text}>
              Se você realizou esta alteração, pode ignorar este e-mail.
            </Text>
            <Text style={text}>
              Se você <strong>não</strong> reconhece esta atividade, por favor, redefina sua senha imediatamente através do link &quot;Esqueceu sua senha?&quot; na página de login e entre em contato com nosso suporte.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordChangedEmail;

// Styles (reutilizados para consistência)
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const heading = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
};

const section = {
  padding: '0 48px',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
}; 