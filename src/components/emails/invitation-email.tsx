import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface InvitationEmailProps {
  invitedByUsername?: string;
  teamName?: string;
  inviteLink?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const InvitationEmail = ({
  invitedByUsername = 'Seu Time',
  teamName = 'Boilerplate Login',
  inviteLink = `${baseUrl}/register`,
}: InvitationEmailProps) => {
  const previewText = `Junte-se ao ${teamName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/static/file.svg`}
            width="42"
            height="42"
            alt={teamName}
            style={logo}
          />
          <Heading style={h1}>Junte-se ao {teamName}</Heading>
          <Text style={text}>
            Olá,
          </Text>
          <Text style={text}>
            <strong>{invitedByUsername}</strong> convidou você para se juntar ao <strong>{teamName}</strong>.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={inviteLink}>
              Aceitar Convite
            </Button>
          </Section>
          <Text style={text}>
            Se você não estava esperando este convite, pode ignorar este e-mail.
          </Text>
          <Text style={footer}>
            Boilerplate Login, Inc.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default InvitationEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
  maxWidth: '100%',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: 'normal',
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '0',
};

const text = {
  color: '#000000',
  fontSize: '14px',
  lineHeight: '24px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '3px',
  color: '#ffffff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
}; 