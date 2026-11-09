import { provision } from './store.mjs';
const [email,role] = process.argv.slice(2);
if (!email || !process.env.GOVCON_PASSWORD) throw new Error('Provide email, role and GOVCON_PASSWORD.');
provision(email.trim().toLowerCase(),role,process.env.GOVCON_PASSWORD);
console.log('Account saved. Previous sessions revoked.');
