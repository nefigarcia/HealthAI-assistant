import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const appointments = [
    {
        name: "Olivia Martin",
        email: "olivia.martin@email.com",
        time: "2:00 PM",
        type: "Check-up",
        status: "Confirmed",
        avatar: "OM",
    },
    {
        name: "Jackson Lee",
        email: "jackson.lee@email.com",
        time: "3:00 PM",
        type: "Follow-up",
        status: "Confirmed",
        avatar: "JL",
    },
    {
        name: "Isabella Nguyen",
        email: "isabella.nguyen@email.com",
        time: "4:00 PM",
        type: "Consultation",
        status: "Pending",
        avatar: "IN",
    },
    {
        name: "William Kim",
        email: "will@email.com",
        time: "5:00 PM",
        type: "Check-up",
        status: "Confirmed",
        avatar: "WK",
    },
]

export function AppointmentsOverview() {
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
                        {appointments.map((appointment) => (
                            <TableRow key={appointment.email}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={`https://placehold.co/40x40.png?text=${appointment.avatar}`} alt={appointment.name} data-ai-hint="person portrait" />
                                            <AvatarFallback>{appointment.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{appointment.name}</div>
                                            <div className="text-sm text-muted-foreground">{appointment.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{appointment.type}</TableCell>
                                <TableCell>{appointment.time}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={appointment.status === "Confirmed" ? "default" : "secondary"} className={appointment.status === "Confirmed" ? "bg-green-500/20 text-green-700 border-green-500/20" : ""}>
                                        {appointment.status}
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
