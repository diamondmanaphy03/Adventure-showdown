export const Conditions: import('../../../sim/dex-conditions').ModdedConditionDataTable = {
	metronometurn: {
		name: 'Metronome Turn',
		onStart(pokemon) {
			this.add('-start', pokemon, 'Metronome Turn');
			this.hint(`${pokemon.name} debe usar Metronome en su primer turno en el campo.`, true);
		},
		onBeforeMove(pokemon, target, move) {
			if (move.id === 'metronome' || move.id === 'struggle') {
				pokemon.m.metronomeDone = true; // obligación cumplida: no se vuelve a imponer
				pokemon.removeVolatile('metronometurn');
				return;
			}

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
