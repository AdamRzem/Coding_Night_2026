// See https://svelte.dev/docs/kit/types#app.d.ts

import type { SupabaseClient, User } from '@supabase/supabase-js';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			user: User | null;
		}

		interface Error {
			message: string;
			requestId?: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
