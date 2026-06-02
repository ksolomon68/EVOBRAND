async function test() {
  try {
    const res = await fetch('https://evobrandconcepts.com/crm/lists');
    console.log(res.status);
    console.log(await res.text());
  } catch (e) {
    console.log(e.message);
  }
}
test();
