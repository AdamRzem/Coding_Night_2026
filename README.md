# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv create --template minimal --types ts --add prettier tailwindcss="plugins:typography,forms" sveltekit-adapter="adapter:auto" --install npm codingSvelte2
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.


## Things to add

Definitely chatling but also own chatbot, give it dataset to know where things are and stuff like that


Install: npm install -g ngrok
Run your dev server: npm run dev
In another terminal: npx ngrok http 5173 (or whatever port SvelteKit is using) + --host-header=rewrite (można)
It works like shit (only use for chatling to learn)


## To use on mobile 
```
npm run dev -- --host
npm run cap:sync
npm run cap:run
```
(jak nie działa ale powinno)


Change	                                Action needed
Svelte pages, CSS, server logic	        Nothing — auto-updates
capacitor.config.ts	                    npm run cap:sync + reinstall
New Capacitor plugin	                npm run cap:sync + reinstall
Android manifest / native code	        npm run cap:sync + reinstall





## Functions
File	                Functions	                                    Purpose / Cel

selectRows.ts	        selectRows	                                    Fetch multiple rows with sort/filter/limit — SELECT *

selectById.ts	        selectById	                                    Fetch a single row by ID — SELECT WHERE id=X

selectWithJoin.ts	    selectWithJoin	                                Fetch rows with related data from another table (JOIN)

insertRow.ts	        insertRow, insertMultipleRows	                Insert one or many rows — INSERT

updateRow.ts	        updateRow, updateMultipleRows	                Update one or many rows — UPDATE

deleteRow.ts	        deleteRow, deleteMultipleRows	                Delete one or many rows — DELETE

upsertRow.ts	        upsertRow	                                    Insert-or-update (UPSERT)

toggleField.ts	        toggleField	                                    Toggle a 0/1 or boolean field (like czy_na_bocznicy)

countRows.ts	        countRows	                                    Efficiently count rows (with optional filter)

paginateRows.ts	        paginateRows	                                Page-by-page data fetching with total count

searchRows.ts	        searchRows, searchRowsMultiColumn	            ILIKE text search in one or multiple columns

rpcCall.ts	            rpcCall	                                        Call PostgreSQL database functions (RPC)

authHelpers.ts	        signInWithEmail, signUpWithEmail, 
                        signInWithOAuth, signOut, 
                        getCurrentUser, getUserDisplayName, 
                        requireAuth	                                    All authentication patterns

validateFormData.ts	    extractFormFields, extractFormNumber, 
                        extractOptionalFields	                        Extract and validate form data in server actions

serverActionHelpers.ts	loadTableData, handleCreateAction,              Ready-to-use server action handlers for common CRUD patterns
                        handleToggleAction, handleDeleteAction	

sendEmail.ts	        sendEmail, sendEmailFromContactForm	            Send emails via the API endpoint

storageUpload.ts	    uploadFile, getSignedUrl, deleteFile	        Supabase Storage file operations

realtimeSubscribe.ts	subscribeToTable, subscribeToRow	            Real-time subscriptions to database changes

index.ts	            —	                                            Re-exports everything for easy imports


Istnieje 
```
    import { selectRows, insertRow } from '$functions';
``` 
do używania tych funckji