'use strict';
const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');

const FILE = 'config/local-accounts.json';
const userid = (process.argv[2] || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
if (!userid) { console.log('Uso: node tools/local-account.js <nombre>'); process.exit(1); }

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
rl._writeToOutput = (s) => { if (!rl.muted) rl.output.write(s); };
process.stdout.write(`Contraseña para ${userid}: `);
rl.muted = true;
rl.question('', (password) => {
	rl.close();
	console.log();
	if (password.length < 8) { console.log('Mínimo 8 caracteres.'); process.exit(1); }
	const salt = crypto.randomBytes(16);
	const hash = crypto.scryptSync(password, salt, 32);
	let accounts = {};
	try { accounts = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch {}
	accounts[userid] = salt.toString('hex') + ':' + hash.toString('hex');
	fs.writeFileSync(FILE, JSON.stringify(accounts, null, '\t'));
	console.log(`Cuenta "${userid}" guardada. Reinicia el servidor para que la cargue.`);
});