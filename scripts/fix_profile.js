const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function check() {
  const email = "miaelo749@gmail.com";
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);
  
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (!profile) {
      console.log("Profile missing, inserting...");
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.raw_user_meta_data?.full_name || user.raw_user_meta_data?.name || "Admin",
        avatar_url: user.raw_user_meta_data?.avatar_url || "",
        is_admin: true
      });
      console.log("Profile inserted and made admin.");
    } else {
      console.log("Profile exists, updating to admin...");
      await supabase.from('profiles').update({ is_admin: true }).eq('id', user.id);
      console.log("Updated.");
    }
  }
}
check();
