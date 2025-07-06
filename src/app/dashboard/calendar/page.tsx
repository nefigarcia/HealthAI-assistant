"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

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
                    <CardDescription>Appointments for today</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <div className="flex-grow">
                                <p className="font-semibold">10:00 AM - Check-up</p>
                                <p className="text-sm text-muted-foreground">John Doe</p>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                        </div>
                         <div className="flex items-center">
                            <div className="flex-grow">
                                <p className="font-semibold">11:30 AM - Consultation</p>
                                <p className="text-sm text-muted-foreground">Jane Smith</p>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                        </div>
                    </div>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full mt-6">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Appointment
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="font-headline">Add New Appointment</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to schedule a new appointment.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="patient-name" className="text-right">Patient Name</Label>
                                    <Input id="patient-name" defaultValue="Pedro Duarte" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="appointment-type" className="text-right">Type</Label>
                                    <Input id="appointment-type" defaultValue="Consultation" className="col-span-3" />
                                </div>
                                 <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="time" className="text-right">Time</Label>
                                    <Input id="time" type="time" defaultValue="14:00" className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save Appointment</Button>
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
