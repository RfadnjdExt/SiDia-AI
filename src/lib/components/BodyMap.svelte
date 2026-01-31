<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let selectedPart: string | null = null;

	// Hover state
	let hoveredPart: string | null = null;

	function handleSelect(part: string) {
		dispatch('select', part);
	}

	// Revised Paths for Anime Female Silhouette (Approximate)
	// Assuming viewBox 0 0 240 450
	const paths = {
		head: 'M120 20 C100 20 85 40 85 65 C85 90 100 100 120 105 C140 100 155 90 155 65 C155 40 140 20 120 20 Z',

		torso: 'M95 110 L145 110 L150 160 L140 210 L100 210 L90 160 Z',

		digestive: 'M100 210 L140 210 L145 260 L135 290 L105 290 L95 260 Z',

		// Arms and Legs spread
		general:
			'M85 110 L60 250 L80 260 L100 130 Z M155 110 L180 250 L160 260 L140 130 Z M100 290 L90 440 L110 445 L115 300 Z M140 290 L150 440 L130 445 L125 300 Z'
	};
</script>

<div class="relative w-64 h-96 mx-auto group">
	<!-- Glowing Background Effect -->
	<div class="absolute inset-0 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>

	<!-- Anime Body Image Base -->
	<img
		src="/anime_body.png"
		alt="Bio-Scan Model"
		class="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_15px_rgba(19,91,236,0.8)] opacity-90"
	/>

	<!-- Interactive SVG Overlay (Invisible Hit Zones -> Visible on Hover) -->
	<svg viewBox="0 0 240 450" class="absolute inset-0 w-full h-full z-10">
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
			class="transition-all duration-300 cursor-pointer
          {selectedPart === 'head'
				? 'fill-primary/40 stroke-primary stroke-2'
				: hoveredPart === 'head'
					? 'fill-primary/20 stroke-primary stroke-1'
					: 'fill-transparent stroke-transparent'}"
			on:mouseenter={() => (hoveredPart = 'head')}
			on:mouseleave={() => (hoveredPart = null)}
			on:click={() => handleSelect('head')}
		/>

		<!-- Torso -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<path
			d={paths.torso}
			class="transition-all duration-300 cursor-pointer
          {selectedPart === 'torso'
				? 'fill-primary/40 stroke-primary stroke-2'
				: hoveredPart === 'torso'
					? 'fill-primary/20 stroke-primary stroke-1'
					: 'fill-transparent stroke-transparent'}"
			on:mouseenter={() => (hoveredPart = 'torso')}
			on:mouseleave={() => (hoveredPart = null)}
			on:click={() => handleSelect('torso')}
		/>

		<!-- Digestive -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<path
			d={paths.digestive}
			class="transition-all duration-300 cursor-pointer
          {selectedPart === 'digestive'
				? 'fill-primary/40 stroke-primary stroke-2'
				: hoveredPart === 'digestive'
					? 'fill-primary/20 stroke-primary stroke-1'
					: 'fill-transparent stroke-transparent'}"
			on:mouseenter={() => (hoveredPart = 'digestive')}
			on:mouseleave={() => (hoveredPart = null)}
			on:click={() => handleSelect('digestive')}
		/>

		<!-- General (Arms/Legs) -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<path
			d={paths.general}
			class="transition-all duration-300 cursor-pointer
          {selectedPart === 'general'
				? 'fill-primary/40 stroke-primary stroke-2'
				: hoveredPart === 'general'
					? 'fill-primary/20 stroke-primary stroke-1'
					: 'fill-transparent stroke-transparent'}"
			on:mouseenter={() => (hoveredPart = 'general')}
			on:mouseleave={() => (hoveredPart = null)}
			on:click={() => handleSelect('general')}
		/>
	</svg>

	<!-- Labels -->
	{#if hoveredPart || selectedPart}
		<div
			class="absolute top-0 right-[-20px] bg-black/90 border border-primary text-primary px-3 py-1 text-[10px] font-mono uppercase tracking-widest rounded transition-all shadow-[0_0_10px_rgba(19,91,236,0.5)] z-20 backdrop-blur-md"
			style="text-shadow: 0 0 5px #135bec;"
		>
			TARGET: {hoveredPart || selectedPart}
		</div>
	{/if}
</div>
