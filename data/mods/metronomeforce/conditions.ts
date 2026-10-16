export const Conditions: import('../../../sim/dex-conditions').ModdedConditionDataTable = {
	metronometurn: {
		name: 'Metronome Turn',
		onStart(pokemon) {
			this.add('-start', pokemon, 'Metronome Turn');
			this.hint(`${pokemon.name} debe usar Metronome en su primer turno en el campo.`, true);
		},
		onBeforeMove(pokemon, target, move) {
			// Struggle siempre se permite (p. ej. si Metronome se queda sin PP o es Taunteado)
			if (move.id === 'metronome' || move.id === 'struggle') {
				pokemon.removeVolatile('metronometurn');
				return;
			}
			// Cualquier otro movimiento falla y se pierde la acción del turno
			this.add('cant', pokemon, 'Metronome Turn', move.name);
			pokemon.removeVolatile('metronometurn');
			return false;
		},
		// Hace que en el selector de movimientos solo se pueda pulsar Metronome
		onDisableMove(pokemon) {
			for (const moveSlot of pokemon.moveSlots) {
				if (moveSlot.id !== 'metronome') pokemon.disableMove(moveSlot.id);
			}
		},
	},
};
