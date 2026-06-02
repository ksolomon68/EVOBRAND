async function test() {
  try {
    const res = await fetch('https://evobrandconcepts.com/api/crash');
    console.log(await res.text());
  } catch (e) {
    console.log(e.message);
  }
}
test();
