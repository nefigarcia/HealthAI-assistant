
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";

const settingsFormSchema = z.object({
  automated_reminders_enabled: z.boolean().default(false),
  automated_reminders_timing_hours: z.string().default("24"),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      automated_reminders_enabled: false,
      automated_reminders_timing_hours: "24",
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const response = await apiFetch('/settings/clinic');
        if (response.success && response.settings) {
          form.reset({
            automated_reminders_enabled: response.settings.automated_reminders_enabled === 'true',
            automated_reminders_timing_hours: response.settings.automated_reminders_timing_hours || "24",
          });
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching settings",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [form, toast]);

  async function onSubmit(data: SettingsFormValues) {
    setIsSaving(true);
    try {
      const result = await apiFetch('/settings/clinic', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (result.success) {
        toast({ title: "Settings Saved", description: "Your automation settings have been updated." });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  }
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Settings</h1>
        <p className="text-muted-foreground">Manage your clinic's settings and integrations.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Automation</CardTitle>
          <CardDescription>Configure automated tasks for your clinic.</CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="automated_reminders_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Automated Appointment Reminders</FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="automated_reminders_timing_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Send Reminder Before Appointment</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select when to send reminders" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="24">24 hours before</SelectItem>
                          <SelectItem value="48">48 hours (2 days) before</SelectItem>
                          <SelectItem value="72">72 hours (3 days) before</SelectItem>
                        </SelectContent>
                      </Select>
                       <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Settings
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
