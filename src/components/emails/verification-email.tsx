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

interface VerificationEmailProps {
  verificationLink?: string;
  userNickname?: string;
}

export const VerificationEmail = ({
  verificationLink = 'http://localhost:3000/verify?token=some-token',
  userNickname = 'Usuário',
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verifique sua conta</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Bem-vindo!</Heading>
          <Section style={section}>
            <Text style={text}>
              Olá, {userNickname}!
            </Text>
            <Text style={text}>
              Obrigado por se registrar. Para ativar sua conta e começar a usar nosso app, por favor, verifique seu endereço de e-mail clicando no botão abaixo.
            </Text>
            <Button style={button} href={verificationLink}>
              Verificar Conta
            </Button>
            <Text style={text}>
              Se o botão não funcionar, copie e cole o seguinte link no seu navegador:
            </Text>
            <Text style={link}>{verificationLink}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;

// Styles (reutilizados do ResetPasswordEmail para consistência)
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