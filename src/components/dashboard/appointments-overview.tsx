"use client"

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton";
import { getAppointments, type Appointment } from "@/services/calendar"
import { format } from "date-fns"

export function AppointmentsOverview() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadAppointments() {
            try {
                const today = new Date();
                const formattedDate = format(today, 'yyyy-MM-dd');
                const data = await getAppointments(formattedDate);
                setAppointments(data);
            } catch (error) {
                console.error("Failed to fetch appointments", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadAppointments();
    }, []);

    if (isLoading) {
        return (
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="font-headline">Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    if (!appointments || appointments.length === 0) {
        return (
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="font-headline">Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-16 text-muted-foreground">
                        <p>No appointments scheduled for today.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {appointments.map((appointment, index) => (
                            <TableRow key={index}>
                         <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={`https://placehold.co/40x40.png?text=${appointment.patientName.split(' ').map(n=>n[0]).join('')}`} alt={appointment.patientName} data-ai-hint="person portrait" />
                                            <AvatarFallback>{appointment.patientName.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{appointment.patientName}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{appointment.type}</TableCell>
                                <TableCell>{appointment.time}</TableCell>
                                <TableCell className="text-right">
                                   <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                   
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
