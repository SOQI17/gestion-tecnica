import { WorkOrder, Engineer, Client } from '../types';

// ─── Outlook Web Calendar link ─────────────────────────────────────────────────

/**
 * Generates a deep-link URL that opens Outlook Web (office.com) with the
 * event pre-filled. Works for Microsoft 365 accounts.
 */
export function generateOutlookWebLink(
  wo: WorkOrder,
  client: Client | undefined,
  engineer: Engineer
): string {
  const [y, m, d] = wo.plannedDate.split('-').map(Number);

  // Parse planned time if available (e.g. "09:00 AM - 11:00 AM")
  let startHour = 9, startMin = 0, endHour = 11, endMin = 0;
  if (wo.plannedTime) {
    const parts = wo.plannedTime.split(' - ');
    const parseTime12h = (t: string) => {
      const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!match) return { h: 9, min: 0 };
      let h = parseInt(match[1]);
      const min = parseInt(match[2]);
      const period = match[3]?.toUpperCase();
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return { h, min };
    };
    const start = parseTime12h(parts[0] || '');
    const end = parseTime12h(parts[1] || '');
    startHour = start.h; startMin = start.min;
    endHour = end.h; endMin = end.min;
  }

  // Build ISO datetime strings (local time — Outlook interprets without Z)
  const pad = (n: number) => String(n).padStart(2, '0');
  const startDt = `${y}-${pad(m)}-${pad(d)}T${pad(startHour)}:${pad(startMin)}:00`;
  const endDt   = `${y}-${pad(m)}-${pad(d)}T${pad(endHour)}:${pad(endMin)}:00`;

  const subject = encodeURIComponent(
    `[${wo.type}] ${client?.name || 'Cliente'} — ${wo.equipmentName}`
  );
  const location = encodeURIComponent(client?.address || client?.name || '');
  const body = encodeURIComponent(
    `Agenda de Mantenimiento ORIMEC\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• OT: ${wo.id}\n` +
    `• Cliente: ${client?.name || '—'}\n` +
    `• Equipo: ${wo.equipmentName}\n` +
    `• Tipo: ${wo.type}\n` +
    `• Ingeniero: ${engineer.name}\n` +
    (wo.notes ? `• Notas: ${wo.notes}\n` : '') +
    `• Estado: ${wo.status}\n`
  );

  // Outlook Web compose URL
  return (
    `https://outlook.office.com/calendar/action/compose` +
    `?rru=addevent` +
    `&startdt=${encodeURIComponent(startDt)}` +
    `&enddt=${encodeURIComponent(endDt)}` +
    `&subject=${subject}` +
    `&location=${location}` +
    `&body=${body}`
  );
}

// ─── .ICS file generator (Outlook desktop / Apple / Google) ────────────────────

/**
 * Generates and triggers download of a .ics file for the given work order.
 * Compatible with Outlook desktop, Apple Calendar, and Google Calendar.
 */
export function downloadICSFile(
  wo: WorkOrder,
  client: Client | undefined,
  engineer: Engineer
): void {
  const [y, m, d] = wo.plannedDate.split('-').map(Number);

  let startHour = 9, startMin = 0, endHour = 11, endMin = 0;
  if (wo.plannedTime) {
    const parts = wo.plannedTime.split(' - ');
    const parseTime12h = (t: string) => {
      const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!match) return { h: 9, min: 0 };
      let h = parseInt(match[1]);
      const min = parseInt(match[2]);
      const period = match[3]?.toUpperCase();
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return { h, min };
    };
    const start = parseTime12h(parts[0] || '');
    const end = parseTime12h(parts[1] || '');
    startHour = start.h; startMin = start.min;
    endHour = end.h; endMin = end.min;
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const dtStart = `${y}${pad(m)}${pad(d)}T${pad(startHour)}${pad(startMin)}00`;
  const dtEnd   = `${y}${pad(m)}${pad(d)}T${pad(endHour)}${pad(endMin)}00`;
  const now     = new Date().toISOString().replace(/[-:.Z]/g, '').slice(0, 15);

  const summary  = `[${wo.type}] ${client?.name || 'Cliente'} — ${wo.equipmentName}`;
  const location = client?.address || client?.name || '';
  const description = [
    `Agenda de Mantenimiento ORIMEC`,
    `OT: ${wo.id}`,
    `Cliente: ${client?.name || '—'}`,
    `Equipo: ${wo.equipmentName}`,
    `Tipo: ${wo.type}`,
    `Ingeniero: ${engineer.name}`,
    wo.notes ? `Notas: ${wo.notes}` : '',
    `Estado: ${wo.status}`,
  ].filter(Boolean).join('\\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ORIMEC FSM//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${wo.id}@orimec.com.ec`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ORIMEC-${wo.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
