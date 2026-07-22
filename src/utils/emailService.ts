import emailjs from '@emailjs/browser';
import { WorkOrder, Engineer, Client } from '../types';

// ─── EmailJS Configuration ────────────────────────────────────────────────────
// These values are loaded from Firestore (settings/emailjs) at runtime,
// so they can be changed from the admin panel without redeploying the app.
// Fallback to hardcoded defaults if Firestore config is not yet set.

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  senderEmail: string; // "alexis.guerra@orimec.com.ec" — changeable
}

// Default config (will be overridden by Firestore settings)
export const DEFAULT_EMAILJS_CONFIG: EmailJSConfig = {
  serviceId: '',      // Set in Firestore: settings/emailjs → serviceId
  templateId: '',     // Set in Firestore: settings/emailjs → templateId
  publicKey: '',      // Set in Firestore: settings/emailjs → publicKey
  senderEmail: 'alexis.guerra@orimec.com.ec',
};

// ─── Format helpers ───────────────────────────────────────────────────────────

const MONTH_NAMES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const DAY_NAMES_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function formatDateEs(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayName = DAY_NAMES_ES[date.getDay()];
  const monthName = MONTH_NAMES_ES[m - 1];
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${d} de ${monthName} de ${y}`;
}

const SERVICE_TYPE_ICONS: Record<string, string> = {
  Preventivo: '🔧',
  Correctivo: '⚠️',
  Instalación: '🔩',
  Calibración: '📐',
  Soporte: '💬',
  FMI: '📋',
  Capacitación: '🎓',
  Inspección: '🔍',
};

// ─── Main send function ────────────────────────────────────────────────────────

export interface SendWOEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Sends a work-order notification email to the assigned engineer.
 * If the engineer has no email, or EmailJS is not configured, it fails silently.
 */
export async function sendWONotificationEmail(
  wo: WorkOrder,
  engineer: Engineer,
  client: Client | undefined,
  supportEngineers: Engineer[],
  config: EmailJSConfig,
  isUpdate = false
): Promise<SendWOEmailResult> {
  // Guard: skip if EmailJS is not configured yet
  if (!config.serviceId || !config.templateId || !config.publicKey) {
    console.warn('[EmailJS] Not configured — skipping notification email.');
    return { success: false, error: 'EmailJS no configurado' };
  }

  // Guard: skip if engineer has no email
  if (!engineer.email) {
    console.warn(`[EmailJS] Engineer ${engineer.name} has no email address.`);
    return { success: false, error: 'Ingeniero sin email registrado' };
  }

  const formattedDate = formatDateEs(wo.plannedDate);
  const serviceIcon = SERVICE_TYPE_ICONS[wo.type] || '🗓️';
  const supportNames = supportEngineers.map(e => e.name).join(', ') || '—';

  const templateParams = {
    // Recipient
    to_email: engineer.email,
    to_name: engineer.name.replace('Ing. ', ''),
    name: 'ORIMEC FSM',         // From Name field in EmailJS template
    email: config.senderEmail,  // Reply To field in EmailJS template

    // Event details
    action_type: isUpdate ? 'ACTUALIZACIÓN' : 'NUEVA AGENDA',
    service_icon: serviceIcon,
    service_type: wo.type,
    client_name: client?.name || 'Cliente no especificado',
    client_address: client?.address || '',
    equipment_name: wo.equipmentName,
    planned_date: formattedDate,
    planned_time: wo.plannedTime || 'No definida',
    work_order_id: wo.id,
    notes: wo.notes || 'Sin observaciones adicionales.',
    support_engineers: supportNames,
    is_equipment_down: wo.isEquipmentDown ? '⚠️ EQUIPO PARADO — Atención prioritaria' : '',

    // Sender info (shown in email footer)
    sender_email: config.senderEmail,
    app_url: window.location.origin,
  };

  try {
    emailjs.init(config.publicKey);
    await emailjs.send(config.serviceId, config.templateId, templateParams);
    console.log(`[EmailJS] ✅ Email sent to ${engineer.email}`);
    return { success: true };
  } catch (err: any) {
    console.error('[EmailJS] ❌ Failed to send email:', err);
    return { success: false, error: err?.text || String(err) };
  }
}
