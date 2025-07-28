
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getPatients, type Patient } from "@/services/patients";
import { getPatientAppointments, type Appointment } from "@/services/calendar";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';


const formSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name is required." }),
  appointmentId: z.string().min(1, { message: "An appointment must be selected." }),
  preferredCommunicationMethod: z.enum(["SMS", "Email"], { required_error: "You need to select a communication method." }),
  clinicName: z.string().min(2, { message: "Clinic name is required." }),
  doctorName: z.string().min(2, { message: "Doctor name is required." }),
  appointmentType: z.string().min(2, { message: "Appointment type is required." }),
});

export default function RemindersPage() {
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isFetchingAppointments, setIsFetchingAppointments] = useState(false);
  const { toast } = useToast();
  
  // State for autocomplete
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [suggestions, setSuggestions] = useState<Patient[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      appointmentId: "",
      preferredCommunicationMethod: "Email",
      clinicName: "HealthAI Clinic",
      doctorName: "",
      appointmentType: "",
    },
  });

  const selectedAppointmentId = form.watch("appointmentId");

  useEffect(()=>{
    if (selectedAppointmentId){
      const selectedAppt= patientAppointments.find(appt => appt.id === selectedAppointmentId)
      if(selectedAppt){
        form.setValue("appointmentType", selectedAppt.type);
        form.setValue("doctorName", selectedAppt.doctorName || "");
      }
    }
  }, [selectedAppointmentId, patientAppointments, form]);

  const fetchAllPatients = async () => {
    try {
        const patientsData = await getPatients();
        setAllPatients(patientsData);
    } catch (error) {
        console.error("Failed to fetch patients for autocomplete", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load patient list."})
    }
   };

  useEffect(() => {
    fetchAllPatients();
  }, []);

  const handlePatientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("patientName", value);
    setSelectedPatient(null); // Clear selected patient if name is manually changed
    setPatientAppointments([]); // Clear appointments when patient changes
    form.reset({
        ...form.getValues(),
        patientName: value,
        appointmentId: "",
        appointmentType: "",
        doctorName: "",
    });
    if (value.length > 0) {
      const filteredSuggestions = allPatients.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setIsSuggestionsOpen(filteredSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      setIsFetchingAppointments(true);
   
    }
  };

  const handleSuggestionClick = async (patient: Patient) => {
    form.setValue("patientName", patient.name);
    setSelectedPatient(patient);
    setSuggestions([]);
    setIsSuggestionsOpen(false);
     try {
        const appointmentsData = await getPatientAppointments(patient.id);
        const futureAppointments = appointmentsData.filter(appt => new Date(appt.datetime) > new Date());
        setPatientAppointments(futureAppointments);
        if (futureAppointments.length === 0) {
            toast({ variant: "default", title: "No Upcoming Appointments", description: "This patient has no future appointments scheduled."})
        }
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch patient appointments."})
    } finally {
        setIsFetchingAppointments(false);
    }
  };

  async function onGenerate(values: z.infer<typeof formSchema>) {
    console.log("Generating message with values:", values);
    setIsLoading(true);
    setGeneratedMessage("");
   const selectedAppt = patientAppointments.find(appt => appt.id === values.appointmentId);
    if (!selectedAppt) {
        toast({ variant: "destructive", title: "Error", description: "Could not find selected appointment details." });
        setIsLoading(false);
        return;
    }

    try {
      const payload = {
        patientName: values.patientName,
        appointmentDateTime: selectedAppt.datetime, // Use the full datetime from the object
        preferredCommunicationMethod: values.preferredCommunicationMethod,
        clinicName: values.clinicName,
        doctorName: values.doctorName,
        appointmentType: values.appointmentType,
      };
      const result = await apiFetch('/ai/personalize-reminder', {
          method: 'POST',
          body: JSON.stringify(payload),
      });
      setGeneratedMessage(result.message);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to generate message",
        description: error.message || "An error occurred while communicating with the AI.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendReminder() {
      if (!generatedMessage || !selectedPatient) {
          toast({ variant: "destructive", title: "Cannot send", description: "A message must be generated and a patient selected." });
          return;
      }
      const selectedAppt = patientAppointments.find(appt => appt.id === form.getValues('appointmentId'));
       if (!selectedAppt) {
        toast({ variant: "destructive", title: "Error", description: "Could not find selected appointment details." });
        return;
      }
      setIsSending(true);
      try {
          const result = await apiFetch('/reminders/send', {
              method: 'POST',
              body: JSON.stringify({
                patientId: selectedPatient.id,
                  patientName: selectedPatient.name,
                  patientEmail: selectedPatient.email,
                  patientPhone: selectedPatient.phone,
                  message: generatedMessage,
                  method: form.getValues('preferredCommunicationMethod'),
                  appointmentDateTime: selectedAppt.datetime,
              })
          });
          toast({ title: "Success", description: result.message });
           setGeneratedMessage("");
          form.reset({
              ...form.getValues(), // keep current form values
              patientName: "", // but clear the patient name
          });
          setSelectedPatient(null);
          setPatientAppointments([]);
      } catch (error: any) {
          toast({ variant: "destructive", title: "Failed to send reminder", description: error.message });
      } finally {
          setIsSending(false);
      }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Automated Reminders</h1>
        <p className="text-muted-foreground">Generate and send personalized appointment reminders.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Patient Information</CardTitle>
            <CardDescription>Fill in the details to generate a reminder message.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit= {form.handleSubmit(onGenerate)} className="space-y-4">
                 <FormField control={form.control} name="patientName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                     <Popover open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
                       <PopoverAnchor asChild>
                           <FormControl>
                               <Input {...field} onChange={handlePatientNameChange} autoComplete="off" placeholder="Start typing patient name..." />
                           </FormControl>
                       </PopoverAnchor>
                       <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField
                  control={form.control}
                  name="appointmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Date & Time</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value} 
                        disabled={!selectedPatient || isFetchingAppointments || patientAppointments.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                                isFetchingAppointments 
                                ? "Loading appointments..." 
                                : !selectedPatient
                                ? "Select a patient first"
                                : "Select an appointment"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {patientAppointments.map(appt => (
                                <SelectItem key={appt.id} value={appt.id}>
                                    {format(new Date(appt.datetime), "MMMM d, yyyy 'at' h:mm a")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="appointmentType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Type</FormLabel>
                    <FormControl><Input {...field} readOnly placeholder="Select an appointment to autofill" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="doctorName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor Name</FormLabel>
                    <FormControl><Input {...field} readOnly placeholder="Select an appointment to autofill" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="clinicName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="preferredCommunicationMethod" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Communication Method</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Email" /></FormControl>
                          <FormLabel className="font-normal">Email</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                           <FormControl><RadioGroupItem value="SMS" /></FormControl>
                          <FormLabel className="font-normal">SMS</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isLoading || !selectedPatient} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Message
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Generated Message</CardTitle>
            <CardDescription>This is the personalized message generated by AI. Review and send it.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Textarea
              readOnly
              value={generatedMessage}
              placeholder="AI-generated message will appear here..."
              className="min-h-[300px] bg-muted h-full"
            />
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSendReminder} disabled={!generatedMessage || isSending}>
                 {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Send Reminder
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
