// Note: These are the rules that formats use

import type { Learnset } from "../../../sim/dex-species";

// The list of formats is stored in config/formats.js
export const Rulesets: import('../../../sim/dex-formats').ModdedFormatDataTable = {

	// Rulesets
	///////////////////////////////////////////////////////////////////
    metronomeforce: {
        effectType: 'Rule',
        name: 'Metronome Force',
        desc: "Todos los Pokémon deben usar Metrónomo en su primer turno activo.",
    
	    onValidateTeam(team) {
        for (const set of team) {
            const hasMetronome = set.moves.some(m => m.valueOf() === 'metronome');
            if (!hasMetronome) {
                return [`${set.name} debe llevar Metrónomo.`];
            }
        }
	    },

        onBegin() {
            this.add('rule', 'Metronome Force: primer turno = Metrónomo obligatorio');
        },
    
        // Cuando un Pokémon entra al campo, le aplicamos el volatile
        onSwitchIn(pokemon) {
            // Solo si está vivo y puede moverse
            if (!pokemon.fainted) {
                pokemon.addVolatile('metronomeforce');
            }
        },
    },
	
	
};
