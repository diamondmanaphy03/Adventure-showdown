// Note: These are the rules that formats use

import type { Learnset } from "../../../sim/dex-species";

// The list of formats is stored in config/formats.js
export const Rulesets: import('../../../sim/dex-formats').ModdedFormatDataTable = {

    metronomeforcemod: {
		effectType: 'Rule',
		name: 'Metronome Force Mod',
		desc: "Cada Pokémon debe usar Metronome el primer turno tras entrar al campo, cada vez que entra.",
		onBegin() {
			this.add('rule', 'Metronome Force Mod: cada Pokémon debe usar Metronome en su primer turno tras entrar al campo.');
		},
		// this = Battle
		onSwitchIn(pokemon) {
			pokemon.addVolatile('metronometurn');
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
