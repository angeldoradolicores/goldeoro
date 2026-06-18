const url = 'https://lrqqfegogsoxebcdnypi.supabase.co/rest/v1';
const headers = {
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycXFmZWdvZ3NveGViY2RueXBpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIyNDY4OSwiZXhwIjoyMDk2ODAwNjg5fQ.G_1tm8rufqGbAmb6n78VXwLQV0ffanZP_Jgl9S3Oy60',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycXFmZWdvZ3NveGViY2RueXBpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIyNDY4OSwiZXhwIjoyMDk2ODAwNjg5fQ.G_1tm8rufqGbAmb6n78VXwLQV0ffanZP_Jgl9S3Oy60',
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function fix() {
  try {
    // Fix Album Panini
    const res1 = await fetch(`${url}/categories?id=eq.3aa8d434-804d-4212-9fb0-2a435574b8e3`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ slug: 'album-panini' })
    });
    console.log('Album Panini updated:', res1.status, await res1.json());

    // Fix Cajas Panini
    const res2 = await fetch(`${url}/categories?id=eq.00a7122c-5fb9-4f1b-bd8f-c42455ea98f8`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ slug: 'cajas-panini' })
    });
    console.log('Cajas Panini updated:', res2.status, await res2.json());
  } catch (err) {
    console.error(err);
  }
}

fix();
