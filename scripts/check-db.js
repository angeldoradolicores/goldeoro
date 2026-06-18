const url = 'https://lrqqfegogsoxebcdnypi.supabase.co/rest/v1';
const headers = {
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycXFmZWdvZ3NveGViY2RueXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMjQ2ODksImV4cCI6MjA5NjgwMDY4OX0.oGQhVeF4dzM9A4-ibNKDZEufHHMbyC9RsNpf60SnpqU',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycXFmZWdvZ3NveGViY2RueXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMjQ2ODksImV4cCI6MjA5NjgwMDY4OX0.oGQhVeF4dzM9A4-ibNKDZEufHHMbyC9RsNpf60SnpqU',
  'Content-Type': 'application/json'
};

async function check() {
  try {
    const catsRes = await fetch(`${url}/categories?select=*`, { headers });
    const categories = await catsRes.json();
    console.log('--- CATEGORIES ---');
    console.log(categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

    const prodsRes = await fetch(`${url}/products?select=id,name,slug,category_id,product_type`, { headers });
    const products = await prodsRes.json();
    console.log('\n--- PRODUCTS ---');
    console.log(products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category_id: p.category_id,
      product_type: p.product_type
    })));
  } catch (err) {
    console.error(err);
  }
}

check();
