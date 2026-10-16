// Note: These are the rules that formats use

import type { Learnset } from "../../../sim/dex-species";

// The list of formats is stored in config/formats.js
export const Rulesets: import('../../../sim/dex-formats').ModdedFormatDataTable = {

    metronomeforceeasymod: {
		effectType: 'Rule',
		name: 'Metronome Force Easy Mod',
		desc: "Cada Pokémon debe usar Metronome el primer turno que entra al combate.",
		onBegin() {
			this.add('rule', 'Metronome Force Easy Mod: cada Pokémon debe usar Metronome en su primer turno que entra al combate.');
		},

		// this = Battle
		onSwitchIn(pokemon) {
			if (!pokemon.m.metronomeDone) pokemon.addVolatile('metronometurn');
		},
		// --- Validación de equipos: a partir de aquí, this = TeamValidator ---
		onValidateSet(set) {
			if (!set.moves.map(m => this.toID(m)).includes('metronome' as ID)) {
                console.log(set.moves.map(m => this.toID(m)));
				return [`${set.name || set.species} debe llevar Metronome entre sus movimientos (Metronome Force Mod).`];
			}
		},
		checkCanLearn(move, species, setSources, set) {
			// Metronome es siempre legal, lo aprenda normalmente o no...
			if (move.id === 'metronome') return null;
			// ...y el resto de movimientos siguen la legalidad normal
			return this.checkCanLearn(move, species, setSources, set);
		},
	},	
};
