async function run() {
  let success = false;
  while (!success) {
    try {
      console.log('Hitting install endpoint...');
      const res = await fetch('https://evobrandconcepts.com/api/install');
      const text = await res.text();
      console.log('Status:', res.status);
      console.log(text);
      if (res.ok && text.includes('Installed dependencies')) {
        success = true;
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
    if (!success) {
      console.log('Waiting 5s...');
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}
run();
