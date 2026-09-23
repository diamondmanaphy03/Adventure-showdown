import {Dex} from '../../../sim/dex';

export const Scripts = {
    gen: 9,
    
    // Modificamos el learnset de TODOS para que aprendan Metrónomo
    init() {
        
        // Iteramos sobre todos los Pokemons
        for (const id in Dex.data.Pokedex) {
            const species = Dex.species.get(id);
            if (!species.exists || species.isNonstandard) continue;
            
            // Añadimos Metrónomo al learnset si no lo tiene
            const learnset = Dex.data.Learnsets[id];
            if (learnset && learnset.learnset) {
                if (!learnset.learnset.metronome) {
                    // '9M' = TM en Gen 9, '9L1' = Nivel 1 en Gen 9
                    learnset.learnset.metronome = ['9M'];
                }
            }
        }
    }
};
