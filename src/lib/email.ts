import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAILS = [
  'nessa.aline@gmail.com',
  'teixeira.lipe@gmail.com',
  'prboris@vinechurch.ca',
];

const HOW_FOUND_LABELS: Record<string, string> = {
  friend: 'Amigo ou Familiar',
  google: 'Google',
  social: 'Redes Sociais',
  passing: 'Passando pelo Local',
  other: 'Outro',
};

interface VisitorEmailData {
  visit_date: string;
  name: string;
  phone: string;
  how_found: string;
  how_found_details?: string | null;
  children?: Array<{
    name: string;
    date_of_birth: string;
    allergies?: string | null;
    special_needs?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    photo_permission?: boolean;
  }>;
}

function formatDateBR(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function buildEmailHtml(visitor: VisitorEmailData): string {
  const howFoundLabel = HOW_FOUND_LABELS[visitor.how_found] || visitor.how_found;
  const visitDateFormatted = formatDateBR(visitor.visit_date);

  const childrenSection =
    visitor.children && visitor.children.length > 0
      ? `
    <h2 style="color:#6d28d9;margin-top:24px;">Crianças Registradas</h2>
    ${visitor.children
      .map(
        (child, i) => `
      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:12px;">
        <p style="margin:0 0 6px 0;"><strong>Criança ${i + 1}:</strong> ${child.name}</p>
        <p style="margin:0 0 6px 0;"><strong>Data de Nascimento:</strong> ${formatDateBR(child.date_of_birth)}</p>
        ${child.allergies ? `<p style="margin:0 0 6px 0;"><strong>Alergias:</strong> ${child.allergies}</p>` : ''}
        ${child.special_needs ? `<p style="margin:0 0 6px 0;"><strong>Necessidades Especiais:</strong> ${child.special_needs}</p>` : ''}
        ${child.emergency_contact_name ? `<p style="margin:0 0 6px 0;"><strong>Contato de Emergência:</strong> ${child.emergency_contact_name} — ${child.emergency_contact_phone || ''}</p>` : ''}
        <p style="margin:0;"><strong>Permissão de Foto:</strong> ${child.photo_permission ? 'Sim' : 'Não'}</p>
      </div>`
      )
      .join('')}
  `
      : '';

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111827;">
      <div style="background:#6d28d9;padding:24px;border-radius:8px 8px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Novo Visitante Registrado</h1>
        <p style="color:#e9d5ff;margin:4px 0 0 0;">Vine Church KWC</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
        <h2 style="color:#6d28d9;margin-top:0;">Dados do Visitante</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 12px;background:#f9fafb;font-weight:600;width:40%;">Data da Visita</td>
            <td style="padding:8px 12px;">${visitDateFormatted}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;background:#f9fafb;font-weight:600;">Nome</td>
            <td style="padding:8px 12px;">${visitor.name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;background:#f9fafb;font-weight:600;">Telefone</td>
            <td style="padding:8px 12px;">${visitor.phone}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;background:#f9fafb;font-weight:600;">Como Nos Conheceu</td>
            <td style="padding:8px 12px;">${howFoundLabel}</td>
          </tr>
          ${
            visitor.how_found_details
              ? `<tr>
            <td style="padding:8px 12px;background:#f9fafb;font-weight:600;">Detalhes</td>
            <td style="padding:8px 12px;">${visitor.how_found_details}</td>
          </tr>`
              : ''
          }
        </table>
        ${childrenSection}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#6b7280;font-size:13px;margin:0;">
          Este email foi gerado automaticamente pelo sistema de cadastro de visitantes da Vine Church KWC.
        </p>
      </div>
    </div>
  `;
}

export async function sendNewVisitorEmail(visitor: VisitorEmailData): Promise<void> {
  const visitDateFormatted = formatDateBR(visitor.visit_date);

  try {
    await resend.emails.send({
      from: 'Vine Church KWC <noreply@vinechurch.ca>',
      to: ADMIN_EMAILS,
      subject: `Novo Visitante: ${visitor.name} — ${visitDateFormatted}`,
      html: buildEmailHtml(visitor),
    });
  } catch (error) {
    // Log but do not throw — email failure should not block visitor registration
    console.error('sendNewVisitorEmail: failed to send email', error);
  }
}
