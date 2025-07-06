export interface Patient {
    id: string;
    name: string;
    email: string;
    avatar: string; // just the initials
}

const patients: Patient[] = [
    { id: '1', name: 'John Doe', email: 'john.doe@email.com', avatar: 'JD' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@email.com', avatar: 'JS' },
    { id: '3', name: 'Olivia Martin', email: 'olivia.martin@email.com', avatar: 'OM' },
    { id: '4', name: 'Liam Johnson', email: 'liam.johnson@email.com', avatar: 'LJ' },
    { id: '5', name: 'Jackson Lee', email: 'jackson.lee@email.com', avatar: 'JL' },
    { id: '6', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', avatar: 'IN' },
    { id: '7', name: 'William Kim', email: 'will@email.com', avatar: 'WK' },
];

export async function getPatients(name?: string): Promise<Patient[]> {
    if (name) {
        return patients.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
    }
    return patients;
}
