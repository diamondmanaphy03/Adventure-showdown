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
    
            onValidateSet(set, format, setHas, teamHas) {
            const species = this.dex.species.get(set.species);
            const problems = [];
            
            // Verificar que Metrónomo esté en el moveset
            const hasMetronome = set.moves.some(m => m.valueOf() === 'Metronome');
            if (!hasMetronome) {
                problems.push(`${set.name || species.name} debe llevar Metrónomo.`);
            }
            
            if (problems.length) return problems;
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
