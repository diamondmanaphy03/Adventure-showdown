/**
 * Minijuego de memoria visual para gimnasios.
 * El líder inicia el reto; el retador pulsa «Jugar» y elige la imagen que vio.
 */
import { FS, Utils  } from '../../lib';

interface MinigameConfig {
	baseUrl: string;
	width: number;
	height: number;
	showSeconds: number;
	maxFails: number;
	folders: { [folder: string]: string[] };
}

const CONFIG_FILE = 'config/minijuego.json';

function loadConfig(): MinigameConfig {
	let config: MinigameConfig;
	try {
		config = JSON.parse(FS(CONFIG_FILE).readSync());
	} catch {
		throw new Chat.ErrorMessage(`No se pudo leer ${CONFIG_FILE}.`);
	}
	const names = Object.keys(config.folders || {});
	if (!names.length) throw new Chat.ErrorMessage("No hay carpetas en la configuración del minijuego.");
	for (const name of names) {
		if (!Array.isArray(config.folders[name]) || config.folders[name].length !== 4) {
			throw new Chat.ErrorMessage(`La carpeta «${name}» debe tener exactamente 4 imágenes.`);
		}
	}
	return config;
}

function shuffle<T>(items: T[]) {
	const a = [...items];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export class GymMinigame extends Rooms.SimpleRoomGame {
	override readonly gameid = 'gymminigame' as ID;
	gameNumber: number;
	cfg: MinigameConfig;
	challengerId: ID;
	challengerName: string;
	folder: string;
	answer: string;
	remaining: string[] = [];
	fails = 0;
	phase: 'ready' | 'showing' | 'choosing' = 'ready';
	showTimer: NodeJS.Timeout | null = null;

	constructor(room: Room, cfg: MinigameConfig, challengerName: string) {
		super(room);
		this.title = 'Minijuego del gimnasio';
		this.gameNumber = room.nextGameNumber();
		this.cfg = cfg;
		this.challengerName = challengerName;
		this.challengerId = toID(challengerName);
		const names = Object.keys(cfg.folders);
		this.folder = names[Math.floor(Math.random() * names.length)];
		const files = cfg.folders[this.folder];
		this.answer = files[Math.floor(Math.random() * files.length)];
	}

	get boxId() {
		return `gymminigame${this.gameNumber}`;
	}
	img(file: string) {
		return `<img src="${this.cfg.baseUrl}/${this.folder}/${file}" width="${this.cfg.width}" height="${this.cfg.height}" />`;
	}
	box(html: string) {
		return `<div class="infobox">${html}</div>`;
	}
	change(html: string) {
		this.room.uhtmlchange(this.boxId, this.box(html));
		this.room.update();
	}
	optionsHtml(note = '') {
		const buttons = this.remaining.map(file =>
			`<button class="button" name="send" value="/minijuego elegir ${file}">${this.img(file)}</button>`
		).join(' ');
		return `${note}<p>¿Cuál era la imagen?</p>${buttons}`;
	}
	checkChallenger(user: User) {
		if (user.id !== this.challengerId) {
			throw new Chat.ErrorMessage("Solo el retador puede hacer esto.");
		}
	}

	open() {
		const html = `Reto para <strong>${Utils.escapeHTML(this.challengerName)}</strong>. ` +
			`<button class="button" name="send" value="/minijuego jugar">Jugar</button>`;
		this.room.add(`|uhtml|${this.boxId}|${this.box(html)}`);
		this.room.update();
	}

	startShowing(user: User) {
		this.checkChallenger(user);
		if (this.phase !== 'ready') throw new Chat.ErrorMessage("El reto ya ha empezado.");
		this.phase = 'showing';
		this.change(`Memoriza esta imagen (${this.cfg.showSeconds} segundos):<br />${this.img(this.answer)}`);
		this.showTimer = setTimeout(() => {
			this.showTimer = null;
			this.phase = 'choosing';
			this.remaining = shuffle(this.cfg.folders[this.folder]);
			this.change(this.optionsHtml());
		}, this.cfg.showSeconds * 1000);
	}

	pick(user: User, file: string) {
		this.checkChallenger(user);
		if (this.phase !== 'choosing') throw new Chat.ErrorMessage("Ahora no se puede elegir.");
		if (!this.remaining.includes(file)) throw new Chat.ErrorMessage("Esa imagen ya no está disponible.");

		if (file === this.answer) {
			this.change(`<strong>¡Correcto!</strong><br />${this.img(this.answer)}`);
			this.room.game = null;
			return;
		}
		this.fails++;
		this.remaining = this.remaining.filter(f => f !== file);
		if (this.fails >= this.cfg.maxFails) {
			this.change(`<strong>Has perdido ${this.challengerName}.</strong>`);
			this.room.game = null;
			return;
		}
		this.change(this.optionsHtml(`<p>Fallo ${this.fails} de ${this.cfg.maxFails}.</p>`));
	}

	end() {
		if (this.showTimer) clearTimeout(this.showTimer);
		this.change('(El minijuego se ha cancelado.)');
		this.room.game = null;
	}
}

export const commands: Chat.ChatCommands = {
	minijuego: {
		iniciar(target, room, user) {
			room = this.requireRoom();
			this.checkCan('minigame', null, room);
			if (room.game) throw new Chat.ErrorMessage(`Ya hay un juego en curso en esta sala (${room.game.title}).`);
			const name = target.trim();
			if (!toID(name)) return this.parse('/help minijuego');
			const game = new GymMinigame(room, loadConfig(), name);
			game.open();
			room.game = game;
			this.modlog('MINIJUEGO', null, name);
			return this.addModAction(`${user.name} ha iniciado el minijuego para ${name}.`);
		},
		jugar(target, room, user) {
			room = this.requireRoom();
			this.requireGame(GymMinigame).startShowing(user);
		},
		elegir(target, room, user) {
			room = this.requireRoom();
			this.requireGame(GymMinigame).pick(user, target.trim());
		},
		cancelar(target, room, user) {
			room = this.requireRoom();
			this.checkCan('minigame', null, room);
			this.requireGame(GymMinigame).end();
			this.modlog('MINIJUEGO CANCELAR');
			return this.privateModAction(`${user.name} ha cancelado el minijuego.`);
		},
	},
	minijuegohelp: [
		"/minijuego iniciar [nombre] - Inicia el minijuego para un retador. Requiere: % @ # ~",
		"/minijuego cancelar - Cancela el minijuego en curso. Requiere: % @ # ~",
	],
};