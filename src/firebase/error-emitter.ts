
import { EventEmitter } from 'events';

// This is a global event emitter to handle errors across the application.
export const errorEmitter = new EventEmitter();
