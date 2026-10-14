// Note: These are the rules that formats use

import type { Learnset } from "../../../sim/dex-species";

// The list of formats is stored in config/formats.js
export const Rulesets: import('../../../sim/dex-formats').ModdedFormatDataTable = {

    fullmetronomemod: {
		effectType: 'Rule',
		name: 'Full Metronome Mod',
		desc: "Cada Pokémon debe usar Metronome durante todo el combate.",
		onBegin() {
			this.add('rule', 'Full Metronome Mod: cada Pokémon debe usar Metronome durante todo el combate.');
		},

		// --- Validación de equipos: a partir de aquí, this = TeamValidator ---
		onValidateSet(set) {
			if(set.moves.length !== 1 || !set.moves.every(m => this.toID(m) === 'metronome')) {
				return [`${set.name || set.species} debe llevar exactamente el movimiento Metronomo (Metronome Force Mod).`];
			}
		},

		checkCanLearn(move, species, setSources, set) {
			// Metronome es siempre legal, lo aprenda normalmente o no...
			if (move.id === 'metronome') return null;
			// ...y el resto de movimientos siguen la legalidad normal
			//return this.checkCanLearn(move, species, setSources, set);
			return null;
		},
	},	
};
