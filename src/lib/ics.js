import { formatDateTime, formatDate, formatTime } from './format';

function escapeIcs(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function icsDate(dateValue, timeValue, fallbackHour = 20) {
  const raw = String(dateValue || '').slice(0, 10);
  const parts = raw.split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  const time = String(timeValue || '').slice(0, 5) || `${String(fallbackHour).padStart(2, '0')}:00`;
  const [hour, minute] = time.split(':');
  return `${year}${month}${day}T${(hour || '00').padStart(2, '0')}${(minute || '00').padStart(2, '0')}00`;
}

function addHours(icsStamp, hours) {
  if (!icsStamp) return null;
  const year = Number(icsStamp.slice(0, 4));
  const month = Number(icsStamp.slice(4, 6)) - 1;
  const day = Number(icsStamp.slice(6, 8));
  const hour = Number(icsStamp.slice(9, 11));
  const minute = Number(icsStamp.slice(11, 13));
  const date = new Date(year, month, day, hour, minute);
  date.setHours(date.getHours() + hours);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

export function buildIcs(activities) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Atletica Lex Leonis//Agenda//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  activities.forEach((activity) => {
    const start = icsDate(activity.date, activity.time, activity.hourFallback ?? 20);
    if (!start) return;
    const end = addHours(start, activity.durationHours ?? 3);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${activity.uid || `${start}-${Math.random().toString(36).slice(2, 8)}`}@lexleonis`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART:${start}`);
    if (end) lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${escapeIcs(activity.title)}`);
    if (activity.description) lines.push(`DESCRIPTION:${escapeIcs(activity.description)}`);
    if (activity.location) lines.push(`LOCATION:${escapeIcs(activity.location)}`);
    if (activity.url) lines.push(`URL:${escapeIcs(activity.url)}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function activityLabel(activity) {
  const date = formatDate(activity.date);
  const time = formatTime(activity.time);
  return time ? `${date} • ${time}` : date;
}

export { formatDateTime, formatDate, formatTime };