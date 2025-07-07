export interface Patient {
    id: string;
    name: string;
    email: string;
    avatar: string; // just the initials
    dob: string; // YYYY-MM-DD
}

const patients: Patient[] = [
    { id: '1', name: 'John Doe', email: 'john.doe@email.com', avatar: 'JD', dob: '1985-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@email.com', avatar: 'JS', dob: '1990-06-20' },
    { id: '3', name: 'Olivia Martin', email: 'olivia.martin@email.com', avatar: 'OM', dob: '1988-11-30' },
    { id: '4', name: 'Liam Johnson', email: 'liam.johnson@email.com', avatar: 'LJ', dob: '1992-03-10' },
    { id: '5', name: 'Jackson Lee', email: 'jackson.lee@email.com', avatar: 'JL', dob: '1979-07-25' },
    { id: '6', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', avatar: 'IN', dob: '2001-09-05' },
    { id: '7', name: 'William Kim', email: 'will@email.com', avatar: 'WK', dob: '1998-12-12' },
    { id: '8', name: 'Sarah Lee', email: 'sarah.lee@email.com', avatar: 'SL', dob: '1995-04-23' },
];

export async function getPatients(name?: string): Promise<Patient[]> {
    if (name) {
        return patients.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
    }
    return patients;
}

export async function getPatientByName(name: string): Promise<Patient | null> {
    const patient = patients.find(p => p.name.toLowerCase() === name.toLowerCase());
    return patient || null;
}

export async function validatePatient(name: string, dob: string): Promise<Patient | null> {
    const patient = patients.find(p => p.name.toLowerCase() === name.toLowerCase() && p.dob === dob);
    return patient || null;
}