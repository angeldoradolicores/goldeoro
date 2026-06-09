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

async function setup() {
  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets.find(b => b.name === 'products');
  
  if (!exists) {
    console.log("Creating 'products' bucket...");
    const { error } = await supabase.storage.createBucket('products', {
      public: true,
      allowedMimeTypes: ['image/*', 'video/*'],
      fileSizeLimit: 52428800 // 50MB
    });
    if (error) console.error("Error creating bucket:", error);
    else console.log("Bucket created successfully.");
  } else {
    console.log("Bucket 'products' already exists.");
  }

  // We can't execute raw SQL easily without RPC, but we can set bucket public and rely on Supabase API keys (Service Role) to upload if needed.
  // Actually, client uploads require RLS policies if uploaded from browser!
  // To upload from browser securely without writing a custom API endpoint, we need RLS.
  // Wait, we can just use the Service Role key in an API route instead! That is much safer and simpler.
  // So we will upload files via a new API route `/api/admin/upload` which uses `supabaseAdmin`.
  console.log("Done.");
}
setup();
