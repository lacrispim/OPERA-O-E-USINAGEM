import { config } from 'dotenv';
config();

import '@/ai/flows/optimize-production-parameters.ts';
import '@/ai/flows/generate-cnc-parameters.ts';
import '@/ai/flows/estimate-machining-time-from-image';
