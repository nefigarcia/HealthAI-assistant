export interface Appointment {
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: string;
}

// In-memory store for appointments for simplicity
let appointments: Appointment[] = [
  { patientName: 'John Doe', date: '2024-08-15', time: '10:00', type: 'Check-up' },
  { patientName: 'Jane Smith', date: '2024-08-15', time: '11:30', type: 'Consultation' },
];

const allSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

export async function getAvailableSlots(date: string): Promise<string[]> {
  const bookedSlots = appointments
    .filter(app => app.date === date)
    .map(app => app.time);
  
  return allSlots.filter(slot => !bookedSlots.includes(slot));
}

export async function bookAppointment(
  patientName: string,
  date: string,
  time: string,
  type: string
): Promise<{ success: boolean; message: string }> {
  const slotsForDate = await getAvailableSlots(date);
  const isSlotAvailable = slotsForDate.includes(time);

  if (!isSlotAvailable) {
    const existingAppointment = appointments.find(a => a.date === date && a.time === time);
    return { success: false, message: `Sorry, the time slot ${time} on ${date} is already booked for ${existingAppointment?.patientName}.` };
  }

  const newAppointment: Appointment = { patientName, date, time, type };
  appointments.push(newAppointment);
  
  return { success: true, message: `Successfully booked an appointment for ${patientName} on ${date} at ${time}.` };
}

export async function getAppointments(date: string): Promise<Appointment[]> {
    return appointments.filter(app => app.date === date).sort((a,b) => a.time.localeCompare(b.time));
}
