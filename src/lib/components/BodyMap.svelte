<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let selectedPart: string | null = null;

	// Hover state
	let hoveredPart: string | null = null;

	function handleSelect(part: string) {
		dispatch('select', part);
	}

	// Simplified Wireframe Paths (Stylized)
	const paths = {
		head: 'M100 50 C100 20 140 20 140 50 C140 75 125 90 120 95 C115 90 100 75 100 50 Z',
		torso: 'M90 100 L150 100 L140 220 L100 220 Z',
		digestive: 'M100 220 L140 220 L135 280 L105 280 Z',
		general:
			'M160 100 L190 250 L180 260 L150 110 Z M80 100 L50 250 L60 260 L90 110 Z M135 280 L145 420 L130 430 L120 280 Z M105 280 L95 420 L110 430 L120 280 Z'
	};
</script>

<div class="relative w-64 h-96 mx-auto group">
	<!-- Glowing Background Effect -->
	<div class="absolute inset-0 bg-primary/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>

	<svg viewBox="0 0 240 450" class="w-full h-full drop-shadow-[0_0_10px_rgba(19,91,236,0.5)]">
		<!-- Defs for Glow -->
		<defs>
			<filter id="glow">
				<feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
				<feMerge>
					<feMergeNode in="coloredBlur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<!-- Head -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<path
			d={paths.head}
			class="transition-all duration-300 cursor-pointer stroke-2
          {selectedPart === 'head'
				? 'fill-primary/50 stroke-primary'
				: hoveredPart === 'head'
					? 'fill-primary/20 stroke-primary'
					: 'fill-transparent stroke-primary/30'}"
			on:mouseenter={() => (hoveredPart = 'head')}
			on:mouseleave={() => (hoveredPart = null)}
			on:click={() => handleSelect('head')}
		/>

		<!-- Torso -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<path
			d={paths.torso}
			class="transition-all duration-300 cursor-pointer stroke-2
          {selectedPart === 'torso'
				? 'fill-primary/50 stroke-primary'
				: hoveredPart === 'torso'
					? 'fill-primary/20 stroke-primary'
					: 'fill-transparent stroke-primary/30'}"
			on:mouseenter={() => (hoveredPart = 'torso')}
			on:mouseleave={() => (hoveredPart = null)}
			on:click={() => handleSelect('torso')}
		/>

		<!-- Digestive -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<path
			d={paths.digestive}
			class="transition-all duration-300 cursor-pointer stroke-2
          {selectedPart === 'digestive'
				? 'fill-primary/50 stroke-primary'
				: hoveredPart === 'digestive'
					? 'fill-primary/20 stroke-primary'
					: 'fill-transparent stroke-primary/30'}"
			on:mouseenter={() => (hoveredPart = 'digestive')}
			on:mouseleave={() => (hoveredPart = null)}
			on:click={() => handleSelect('digestive')}
		/>

		<!-- General (Arms/Legs) -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<path
			d={paths.general}
			class="transition-all duration-300 cursor-pointer stroke-2
          {selectedPart === 'general'
				? 'fill-primary/50 stroke-primary'
				: hoveredPart === 'general'
					? 'fill-primary/20 stroke-primary'
					: 'fill-transparent stroke-primary/30'}"
			on:mouseenter={() => (hoveredPart = 'general')}
			on:mouseleave={() => (hoveredPart = null)}
			on:click={() => handleSelect('general')}
		/>
	</svg>

	<!-- Labels -->
	{#if hoveredPart || selectedPart}
		<div
			class="absolute top-4 right-0 bg-black/80 border border-primary text-primary px-3 py-1 text-xs font-mono uppercase tracking-widest rounded transition-all"
		>
			SCANNING: {hoveredPart || selectedPart}
		</div>
	{/if}
</div>
