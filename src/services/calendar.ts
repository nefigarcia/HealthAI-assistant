export interface Appointment {
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: string;
}

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// In-memory store for appointments for simplicity
let appointments: Appointment[] = [
  { patientName: 'John Doe', date: formatDate(today), time: '10:00', type: 'Check-up' },
  { patientName: 'Jane Smith', date: formatDate(today), time: '11:30', type: 'Consultation' },
  { patientName: 'Liam Johnson', date: formatDate(tomorrow), time: '09:00', type: 'New Patient' },
  { patientName: 'Sarah Lee', date: formatDate(today), time: '14:00', type: 'Consultation' },
  { patientName: 'Sarah Lee', date: formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)), time: '10:30', type: 'Follow-up' },
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

export async function getAppointmentsForPatient(patientName: string): Promise<Appointment[]> {
    return appointments.filter(app => app.patientName.toLowerCase() === patientName.toLowerCase()).sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export async function rescheduleAppointment(
  patientName: string,
  currentDate: string,
  currentTime: string,
  newDate: string,
  newTime: string
): Promise<{ success: boolean; message: string }> {
  const appIndex = appointments.findIndex(app => 
    app.patientName.toLowerCase() === patientName.toLowerCase() && 
    app.date === currentDate && 
    app.time === currentTime
  );

  if (appIndex === -1) {
    return { success: false, message: "Could not find the original appointment to reschedule." };
  }

  const originalAppointment = appointments[appIndex];

  const availableSlots = await getAvailableSlots(newDate);
  if (newDate !== currentDate || newTime !== currentTime) {
    if (!availableSlots.includes(newTime)) {
        return { success: false, message: `The new time slot ${newTime} on ${newDate} is not available.` };
    }
  }

  appointments[appIndex] = { ...originalAppointment, date: newDate, time: newTime };
  
  return { success: true, message: `Your appointment has been successfully rescheduled to ${newDate} at ${newTime}.` };
}