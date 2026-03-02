import bcrypt from "bcrypt";

const password = process.argv[2];

if (!password) {
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);

console.log(hash);
