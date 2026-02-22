<script lang="ts">
    import { supabase } from "$lib/supabaseClient";

    let displayName = $state('');
    let email = $state('');
    let password = $state('');
    let error = $state('');
    let success = $state('');
    let loading = $state(false);

    async function handleSubmit(event: Event) {
        event.preventDefault();
        error = '';
        success = '';
        loading = true;

        const { error: err } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        });

        loading = false;

        if (err) {
            error = err.message;
        } else {
            success = 'Check your email for a confirmation link!';
            displayName = '';
            email = '';
            password = '';
        }
    }

    async function handleSubmitGoogle(event: Event) {
        event.preventDefault();
        error = '';

        const { error: err } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (err) {
            error = err.message;
        }
    }
</script>

<div class="max-w-md mx-auto space-y-6">
    <div class="text-center">
        <h1 class="text-3xl font-bold tracking-tight">Create an account</h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">Join BlogApp and start posting</p>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-5">
        {#if error}
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
            </div>
        {/if}

        {#if success}
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-sm">
                {success}
            </div>
        {/if}

        <form class="space-y-4" onsubmit={handleSubmit}>
            <div>
                <label for="displayName" class="block text-sm font-medium mb-1.5">Display Name</label>
                <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    bind:value={displayName}
                    placeholder="Your name"
                    class="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                    required
                />
            </div>

            <div>
                <label for="email" class="block text-sm font-medium mb-1.5">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    bind:value={email}
                    placeholder="you@example.com"
                    class="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                    required
                />
            </div>

            <div>
                <label for="password" class="block text-sm font-medium mb-1.5">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    bind:value={password}
                    placeholder="••••••••"
                    class="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                    required
                    minlength="6"
                />
                <p class="mt-1 text-xs text-gray-400">At least 6 characters</p>
            </div>

            <button
                type="submit"
                disabled={loading}
                class="w-full inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow"
            >
                {#if loading}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                {:else}
                    Create account
                {/if}
            </button>
        </form>

        <div class="relative">
            <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
                <span class="px-3 bg-white dark:bg-gray-900 text-gray-400">or</span>
            </div>
        </div>

        <button
            onclick={handleSubmitGoogle}
            class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-all duration-200"
        >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
        </button>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?
            <a href="/login" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                Sign in
            </a>
        </p>
    </div>
</div>