import { config } from 'dotenv';
config();

import '@/ai/flows/automated-response-suggestions.ts';
import '@/ai/flows/reminder-message-personalization.ts';
import '@/ai/flows/appointment-summarization.ts';
import '@/ai/flows/general-assistant.ts';
import '@/ai/flows/patient-assistant.ts';
