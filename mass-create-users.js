import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = ''; // From .env or Supabase dashboard
const SUPABASE_ANON_KEY = ''; // From .env or Supabase dashboard

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const NUM_USERS = 65;
const POST_PROBABILITY = 0;

async function createUserAndPost(index) {
  const username = `testuser_${Date.now()}_${index}`;
  const email = `${username}@test.com`;
  
  try {
    // Register
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: 'Test123!',
      options: {
        data: { displayName: username } // Store username in user metadata if needed
      }
    });
    
    if (signUpError) throw signUpError;
    console.log(`✓ Created user: ${username}`);
    
    // Create post (if user should post)
    if (Math.random() < POST_PROBABILITY && signUpData.user) {
      const { error: postError } = await supabase
        .from('BlogPost') // Change to your actual table name
        .insert({
          title: signUpData.user.id,
          text: `Test post from ${username}`,
          user_id: signUpData.user.id, 
          user_display_name: username
          // Add other required fields based on your schema
        });
      
      if (postError) {
        console.error(`  ✗ Post failed for ${username}:`, postError.message);
      } else {
        console.log(`  ✓ Created post for ${username}`);
      }
    }
  } catch (error) {
    console.error(`✗ Failed for user ${index}:`, error.message);
  }
}

async function main() {
  console.log(`Creating ${NUM_USERS} users...`);
  for (let i = 0; i < NUM_USERS; i++) {
    await createUserAndPost(i);
    await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
  }
  console.log('Done!');
}

main();

// TO RUN SUPABASE > AUTHENTICATION > SING IN/PROVIDERS > DISABLE CONFIRMATION EMAILS
