async function check() {
  const res = await fetch('https://evobrandconcepts.com');
  const text = await res.text();
  const match = text.match(/assets\/index-[a-z0-9]+\.js/);
  console.log(match ? match[0] : 'Not found');
}
check();
