<script lang="ts">
	import '../app.css';
	import { HistoryService, type HistoryLog } from '$lib/services/HistoryService';
	import { selectedHistoryItem } from '$lib/stores/appState';

	let { children } = $props();
	let query = $state('');
	let searchResults: HistoryLog[] = $state([]);

	function handleSearch() {
		if (!query.trim()) {
			searchResults = [];
			return;
		}
		searchResults = HistoryService.search(query);
	}

	function selectHistory(log: HistoryLog) {
		selectedHistoryItem.set(log.result);
		query = '';
		searchResults = [];
	}
</script>

<div
	class="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark text-white font-display selection:bg-primary/30"
>
	<!-- Top Navigation -->
	<header
		class="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50"
	>
		<div class="flex items-center gap-8">
			<a class="flex items-center gap-3 text-white hover:opacity-80 transition-opacity" href="/">
				<div class="size-8 bg-primary rounded flex items-center justify-center">
					<span class="material-symbols-outlined text-white">clinical_notes</span>
				</div>
				<h2 class="text-xl font-bold leading-tight uppercase tracking-widest hidden sm:block">
					Intelijen Medis <span class="text-primary">SiDia</span>
				</h2>
				<h2 class="text-xl font-bold leading-tight uppercase tracking-widest sm:hidden">
					SiDia <span class="text-primary">AI</span>
				</h2>
			</a>
		</div>
		<div class="flex items-center gap-4">
			<div class="relative hidden sm:block group z-50">
				<span
					class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"
					>search</span
				>
				<input
					bind:value={query}
					oninput={handleSearch}
					class="bg-white/5 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary w-64 text-white placeholder-white/40 outline-none transition-all focus:w-80"
					placeholder="Cari riwayat..."
				/>

				{#if query && searchResults.length > 0}
					<div
						class="absolute top-full left-0 w-full mt-2 bg-background-dark border border-white/10 rounded-xl shadow-xl overflow-hidden backdrop-blur-xl"
					>
						{#each searchResults as log}
							<button
								class="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex flex-col gap-1 cursor-pointer"
								onclick={() => selectHistory(log)}
							>
								<span class="text-xs font-bold text-white mb-0.5">{log.result.disease?.name}</span>
								<div class="flex justify-between items-center text-[10px] text-white/40">
									<span>{new Date(log.timestamp).toLocaleDateString()}</span>
									<span class="text-primary">{log.result.matchCount} Gejala</span>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Avatar Section -->
			<!-- Avatar Section -->
			<button
				class="size-10 rounded-full border-2 border-primary/50 overflow-hidden hover:border-primary transition-colors cursor-pointer"
				aria-label="Profil Pengguna"
			>
				<img
					alt="Medical officer profile avatar"
					class="w-full h-full object-cover"
					src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsef7zo9fsfcZ3M0UTT0GTJhvfVvQzipGeIWH0Ek6e5xSpV9Xqnd7pW4Fs9EU_5DKQKmNZoagiv98rE705Bu3aOCSts6C4y7B_TbEETsz-qwYN2l1vtcHb4wjN4mFpXNICA9sTCJSD-SyZQWjN6XXDabFFMV7VrANgLqRjz0zZWPXXcR2agqMFrSCDaMKzkp9HfYQCudi4pSY5tOvXEfVbIE7XlGdpo4AlWr8BYJKFtcxLIP0NtztNiJvXktRo_pZcQzbaNbKDjGH1"
				/>
			</button>
		</div>
	</header>

	<div class="flex flex-1">
		<!-- Sidebar -->

		<!-- Main Content Area -->
		<main class="flex-1 noir-gradient relative flex flex-col min-w-0">
			<!-- Heartbeat Background Overlay -->
			<div
				class="absolute inset-0 pointer-events-none opacity-20 flex items-end overflow-hidden z-0"
			>
				<svg class="w-full h-48" preserveAspectRatio="none" viewBox="0 0 1000 100">
					<path
						class="heartbeat-line vector-effect-non-scaling-stroke"
						d="M0,50 L200,50 L210,30 L220,70 L230,20 L240,80 L250,50 L450,50 L460,10 L470,90 L480,50 L700,50 L710,40 L720,60 L730,50 L1000,50"
					></path>
				</svg>
			</div>

			<div class="relative z-10 flex-1 flex flex-col">
				{@render children()}
			</div>

			<!-- Bottom Status Bar -->
			<footer
				class="mt-auto border-t border-white/10 p-4 bg-black/60 flex items-center justify-center text-[10px] font-bold tracking-widest uppercase text-white/40 relative z-20"
			>
				<span class="text-primary/60">© 2026 INTELIJEN MEDIS SIDIA</span>
			</footer>
		</main>
	</div>
</div>
