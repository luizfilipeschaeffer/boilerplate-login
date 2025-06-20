import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordEmailProps {
  resetLink?: string;
}

export const ResetPasswordEmail = ({
  resetLink = 'http://localhost:3000/reset-password?token=some-token',
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Redefina sua senha</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Redefina sua Senha</Heading>
          <Section style={section}>
            <Text style={text}>
              Olá,
            </Text>
            <Text style={text}>
              Recebemos uma solicitação para redefinir a senha da sua conta. Se você não fez essa solicitação, pode ignorar este e-mail.
            </Text>
            <Text style={text}>
              Para redefinir sua senha, clique no botão abaixo:
            </Text>
            <Button style={button} href={resetLink}>
              Redefinir Senha
            </Button>
            <Text style={text}>
              Se o botão não funcionar, copie e cole o seguinte link no seu navegador:
            </Text>
            <Text style={link}>{resetLink}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

// Styles
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

const button = {
  backgroundColor: '#007bff',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

const link = {
  color: '#007bff',
  fontSize: '14px',
  textDecoration: 'underline',
}; 