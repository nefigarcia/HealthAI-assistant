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
import { getPatients, type Patient } from "@/services/patients"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"
import { format } from 'date-fns';


function formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}
function formatTime(datetimeString: string): string {
    console.log("datetimeformat",datetimeString)
    if (!datetimeString) return '';
    const date = new Date(datetimeString);
    if (isNaN(date.getTime())) return 'Invalid Time'; // Return empty string if date is invalid
    return format(date, 'h:mm a'); // e.g., 14:30
}
function formatReadableDateTime(datetimeString: string): string {
    if (!datetimeString) return 'Invlalid date';
      // Replace space with 'T' to ensure ISO 8601 format for reliable parsing
     const isoString = datetimeString.includes(' ') ? datetimeString.replace(' ', 'T') : datetimeString;
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, "MMMM d, yyyy 'at' h:mm a"); 
}
export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);  
  const [newAppointment, setNewAppointment] = useState({ patientName: '', type: '', time: '' });
  // State for autocomplete
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [suggestions, setSuggestions] = useState<Patient[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
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

   const fetchAllPatients = async () => {
    try {
        const patientsData = await getPatients();
        setAllPatients(patientsData);
    } catch (error) {
        console.error("Failed to fetch patients for autocomplete", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load patient list for suggestions."})
    }
   };

  useEffect(() => {
    fetchAppointments();
  }, [date])

  useEffect(() => {
    // Fetch all patients once when the component mounts
    fetchAllPatients();
  }, []);

  const handlePatientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewAppointment({...newAppointment, patientName: value});
    if (value.length > 0) {
      const filteredSuggestions = allPatients.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setIsSuggestionsOpen(filteredSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    }
  };

  const handleSuggestionClick = (patient: Patient) => {
    setNewAppointment({...newAppointment, patientName: patient.name});
    setSuggestions([]);
    setIsSuggestionsOpen(false);
  };
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewDialogOpen(true);
  };
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
        
        toast({ title: "Success", description: result.message });
        fetchAppointments(); // Refresh appointments list
        setIsAddDialogOpen(false); // Close dialog
        setNewAppointment({ patientName: '', type: '', time: '' }); // Reset form 
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
                           appointments.map((app, index) => (console.log("app",app),
                             <div key={index} className="flex items-center">
                                <div className="flex-grow">
                                    <p className="font-semibold">{formatTime(app.datetime)} - {app.type}</p>
                                    <p className="text-sm text-muted-foreground">{app.patientName}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleViewAppointment(app)}>View</Button>
                            </div>
                           ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No appointments for this day.</p>
                        )}
                    </div>
                     <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                                      <Popover open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
                                       <PopoverAnchor asChild>
                                           <Input id="patient-name" value={newAppointment.patientName} onChange={handlePatientNameChange} className="col-span-3" autoComplete="off" />
                                       </PopoverAnchor>
                                       <PopoverContent className="w-[360px] p-0" align="start">
                                            <div className="border rounded-md max-h-40 overflow-y-auto">
                                                {suggestions.map((patient) => (
                                                    <div 
                                                        key={patient.id} 
                                                        className="px-3 py-2 cursor-pointer hover:bg-muted"
                                                        onClick={() => handleSuggestionClick(patient)}
                                                    >
                                                        <p className="font-medium">{patient.name}</p>
                                                        <p className="text-xs text-muted-foreground">{patient.email}</p>
                                                    </div>
                                                ))}
                                            </div>
                                       </PopoverContent>
                                    </Popover>
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
       {/* View Appointment Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
            {selectedAppointment && (
                <>
                <DialogHeader>
                    <DialogTitle className="font-headline">Appointment Details</DialogTitle>
                    <DialogDescription>
                        Full details for the scheduled appointment.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right font-semibold">Patient</Label>
                        <p className="col-span-2">{selectedAppointment.patientName}</p>
                    </div>
                     <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right font-semibold">Type</Label>
                        <p className="col-span-2">{selectedAppointment.type}</p>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right font-semibold">Date & Time</Label>
                        <p className="col-span-2">{formatReadableDateTime(selectedAppointment.datetime)}</p>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right font-semibold">Status</Label>
                        <p className="col-span-2 capitalize">{selectedAppointment.status}</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                </DialogFooter>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
