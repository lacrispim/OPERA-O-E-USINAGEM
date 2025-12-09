// This file is specific to the Firestore error handling setup and is not used by Realtime Database.
// It can be deleted. It is kept here for reference in case Firestore is re-enabled.

import { EventEmitter } from 'events';

// This is a global event emitter to handle errors across the application.
export const errorEmitter = new EventEmitter();
