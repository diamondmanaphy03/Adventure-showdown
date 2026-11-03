import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const FILE = path.resolve('config/local-accounts.json'); // se resuelve desde la carpeta del servidor
const MAX_FAILS = 5;
const LOCK_MS = 10 * 60 * 1000;

let accounts: Record<string, string> = {};
try {
	accounts = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch {}

const fails = new Map<string, { count: number, until: number }>();

export function has(userid: string) {
	return Object.prototype.hasOwnProperty.call(accounts, userid);
}

export function verify(userid: string, password: string, ip: string): 'ok' | 'wrong' | 'locked' {
	const key = `${userid}|${ip}`;
	const state = fails.get(key);
	if (state && state.until > Date.now()) return 'locked';

	const [saltHex, hashHex] = accounts[userid].split(':');
	const expected = Buffer.from(hashHex, 'hex');
	const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
	if (crypto.timingSafeEqual(actual, expected)) {
		fails.delete(key);
		return 'ok';
	}
	const count = (state?.count || 0) + 1;
	fails.set(key, { count, until: count >= MAX_FAILS ? Date.now() + LOCK_MS : 0 });
	return count >= MAX_FAILS ? 'locked' : 'wrong';
}