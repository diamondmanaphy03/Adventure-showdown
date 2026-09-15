export const Scripts = {
	inherit: 'gen9',
    
    // Modificamos el learnset de TODOS los Pokémon para que aprendan Metrónomo
    init() {
        const metronomeMove = this.dex.moves.get('metronome');
        
        // Iteramos sobre todas las especies
        for (const id in this.dex.data.Pokedex) {
            const species = this.dex.species.get(id);
            if (!species.exists || species.isNonstandard) continue;
            
            // Añadimos Metrónomo al learnset si no lo tiene
            const learnset = this.dex.data.Learnsets[id];
            if (learnset && learnset.learnset) {
                if (!learnset.learnset.metronome) {
                    // '9M' = TM en Gen 9, '9L1' = Nivel 1 en Gen 9
                    learnset.learnset.metronome = ['9M'];
                }
            }
        }
    }
};
