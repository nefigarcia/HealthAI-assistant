"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"
import type { Appointment } from "@/services/calendar"

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newAppointment, setNewAppointment] = useState({ patientName: '', type: '', time: '' });
  
  const { toast } = useToast()

  const fetchAppointments = async () => {
    if (date) {
      setIsLoading(true);
      try {
        const formattedDate = formatDate(date);
        const data = await apiFetch(`/calendar/appointments?date=${formattedDate}`);
        setAppointments(data || []);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch appointments."})
      } finally {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, [date])

  const handleSaveAppointment = async () => {
    if (!date || !newAppointment.patientName || !newAppointment.time || !newAppointment.type) {
        toast({ variant: "destructive", title: "Missing fields", description: "Please fill out all fields."})
        return;
    }
    
    try {
        const formattedDate = formatDate(date);
        const result = await apiFetch('/calendar/appointments', {
            method: 'POST',
            body: JSON.stringify({ 
                patientName: newAppointment.patientName, 
                date: formattedDate, 
                time: newAppointment.time, 
                type: newAppointment.type 
            }),
        });
        
        if (result.success) {
            toast({ title: "Success", description: result.message });
            fetchAppointments(); // Refresh appointments list
            setIsDialogOpen(false); // Close dialog
            setNewAppointment({ patientName: '', type: '', time: '' }); // Reset form
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    } catch (error: any) {
         toast({ variant: "destructive", title: "Error", description: error.message });
    }
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Calendar</h1>
        <p className="text-muted-foreground">Manage your appointments and schedule.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardContent className="p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="p-0"
                        classNames={{
                            root: "w-full",
                            months: "w-full flex-col sm:flex-col md:flex-row",
                            month: "w-full space-y-4 p-4",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex justify-around",
                            row: "flex w-full mt-2 justify-around",
                        }}
                    />
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">
                        {date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No date selected'}
                    </CardTitle>
                    <CardDescription>{isLoading ? "Loading..." : `You have ${appointments.length} appointments.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-24">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : appointments.length > 0 ? (
                           appointments.map((app, index) => (
                             <div key={index} className="flex items-center">
                                <div className="flex-grow">
                                    <p className="font-semibold">{app.time} - {app.type}</p>
                                    <p className="text-sm text-muted-foreground">{app.patientName}</p>
                                </div>
                                <Button variant="ghost" size="sm">View</Button>
                            </div>
                           ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No appointments for this day.</p>
                        )}
                    </div>
                     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full mt-6" disabled={!date}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Appointment
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="font-headline">Add New Appointment</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to schedule a new appointment for {date?.toLocaleDateString()}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="patient-name" className="text-right">Patient Name</Label>
                                    <Input id="patient-name" value={newAppointment.patientName} onChange={(e) => setNewAppointment({...newAppointment, patientName: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="appointment-type" className="text-right">Type</Label>
                                    <Input id="appointment-type" value={newAppointment.type} onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value})} className="col-span-3" />
                                </div>
                                 <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="time" className="text-right">Time</Label>
                                    <Input id="time" type="time" value={newAppointment.time} onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSaveAppointment}>Save Appointment</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
