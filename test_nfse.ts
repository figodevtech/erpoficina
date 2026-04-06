import * as fs from 'fs';

async function run() {
  const res = await fetch('http://localhost:3000/api/debug');
  const json = await res.json();
  fs.writeFileSync('token.txt', json.token || 'NO_TOKEN');
}
run();
