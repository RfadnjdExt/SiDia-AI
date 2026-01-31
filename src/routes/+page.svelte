<script lang="ts">
	import { fade, blur, fly } from 'svelte/transition';
	import { allSymptoms, symptomCategories } from '$lib/data/diseases';
	import type { DiagnosisResult } from '$lib/types';
	import { ReportFactory } from '$lib/services/ReportFactory';
	import { HistoryService, type HistoryLog } from '$lib/services/HistoryService';
	import { selectedHistoryItem } from '$lib/stores/appState';
	import { onDestroy, onMount } from 'svelte';
	import BodyMap from '$lib/components/BodyMap.svelte';

	let selectedSymptoms: string[] = $state([]);
	let results: DiagnosisResult[] = $state([]);
	let hasAnalyzed = $state(false);
	let isLoading = $state(false);
	let errorMsg = $state('');
	let inputQuery = $state('');
	let showHistory = $state(false);
	let historyLogs: HistoryLog[] = $state([]);

	// Voice Interface State
	let isVoiceEnabled = $state(true);
	let isSpeaking = $state(false);
	let synth: SpeechSynthesis | null = null;
	let voiceAI: SpeechSynthesisVoice | null = null;
	let voiceDoctor: SpeechSynthesisVoice | null = null;
	let dialogueScript: { role: 'AI' | 'Doctor'; text: string }[] = $state([]);
	let currentDialogueIndex = $state(-1);

	// View Mode State
	let viewMode: 'list' | 'map' = $state('list');
	let selectedBodyPart: string | null = $state(null);

	onMount(() => {
		if (typeof window !== 'undefined') {
			synth = window.speechSynthesis;
			// Load voices
			const loadVoices = () => {
				const voices = synth?.getVoices() || [];
				// Sort to prefer English
				const enVoices = voices.filter((v) => v.lang.startsWith('en'));

				// 1. AI Voice (Prefer Google US English or Zira - Female/Robotic)
				voiceAI =
					enVoices.find(
						(v) => v.name.includes('Google US English') || v.name.includes('Microsoft Zira')
					) ||
					enVoices[0] ||
					null;

				// 2. Doctor Voice (Prefer Male or Distinct form AI)
				// Try to find a male voice if AI is female (Zira/Google US are usually female sounding)
				voiceDoctor =
					enVoices.find(
						(v) =>
							v.name !== voiceAI?.name &&
							(v.name.includes('Mark') || v.name.includes('David') || v.name.includes('Male'))
					) ||
					enVoices.find((v) => v.name !== voiceAI?.name) ||
					voiceAI ||
					null;
			};
			loadVoices();
			if (synth?.onvoiceschanged !== undefined) {
				synth.onvoiceschanged = loadVoices;
			}
		}
	});

	onDestroy(() => {
		if (synth) {
			synth.cancel();
		}
	});

	// Restore from History
	selectedHistoryItem.subscribe((data) => {
		if (data) {
			results = [data];
			hasAnalyzed = true;
			// Also restore symptoms for visual consistency
			if (data.disease?.matchedSymptoms) {
				selectedSymptoms = [...data.disease.matchedSymptoms];
			}
			// Don't auto-speak on history restore to avoid annoyance
		}
	});

	// UI States

	function toggleSymptom(symptom: string) {
		if (selectedSymptoms.includes(symptom)) {
			selectedSymptoms = selectedSymptoms.filter((s) => s !== symptom);
		} else {
			selectedSymptoms = [...selectedSymptoms, symptom];
		}
		errorMsg = '';
	}

	function handleBodyPartSelect(event: CustomEvent<string>) {
		const part = event.detail;
		selectedBodyPart = part === selectedBodyPart ? null : part;
	}

	function handleInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			const val = inputQuery.trim();
			if (val && !selectedSymptoms.includes(val)) {
				toggleSymptom(val);
				inputQuery = '';
			}
		}
	}

	function clearSelection() {
		stopSpeaking();
		selectedSymptoms = [];
		hasAnalyzed = false;
		errorMsg = '';
		results = [];
		dialogueScript = [];
	}

	function stopSpeaking() {
		if (synth) {
			synth.cancel();
			isSpeaking = false;
			currentDialogueIndex = -1;
		}
	}

	function generateScript(result: DiagnosisResult): { role: 'AI' | 'Doctor'; text: string }[] {
		if (!result.disease) return [];
		const diseaseName = result.disease.name;
		const confidence = Math.round((result.matchCount / result.totalSymptoms) * 100);

		// Base AI Report
		const script: { role: 'AI' | 'Doctor'; text: string }[] = [
			{
				role: 'AI',
				text: `Subject identified. Diagnosis: ${diseaseName}. Confidence level: ${confidence} percent.`
			},
			{ role: 'AI', text: `Analysis: ${result.disease.description}` }
		];

		// Doctor Commentary (Easter Egg or Standard)
		if (diseaseName === 'Sindrom Wibu Akut') {
			script.push({ role: 'Doctor', text: 'Oh good heavens. Another one lost to the 2D realm.' });
			script.push({
				role: 'Doctor',
				text: 'Listen to me closely. Turn off the computer. Go outside. And touch some grass. Immediate rehabilitation required.'
			});
		} else {
			script.push({ role: 'Doctor', text: `Hmm. ${diseaseName}. Doctor's recommendation:` });
			script.push({ role: 'Doctor', text: result.disease.advice });
		}

		return script;
	}

	function speakResult(result: DiagnosisResult) {
		// Stop any existing speech
		stopSpeaking();

		if (!isVoiceEnabled || !synth || !result.disease) return;

		dialogueScript = generateScript(result);

		playDialogue(0);
	}

	function playDialogue(index: number) {
		if (index >= dialogueScript.length) {
			isSpeaking = false;
			currentDialogueIndex = -1;
			return;
		}

		isSpeaking = true;
		currentDialogueIndex = index;
		const line = dialogueScript[index];
		const utterance = new SpeechSynthesisUtterance(line.text);

		// Assign Voice based on Role
		if (line.role === 'AI') {
			if (voiceAI) utterance.voice = voiceAI;
			utterance.rate = 0.9;
			utterance.pitch = 0.8; // Lower/Robot
		} else {
			if (voiceDoctor) utterance.voice = voiceDoctor;
			utterance.rate = 1.0;
			utterance.pitch = 1.0; // Normal/Human
		}

		utterance.onend = () => {
			playDialogue(index + 1);
		};

		utterance.onerror = () => {
			isSpeaking = false;
		};

		synth?.speak(utterance);
	}

	async function handleDiagnose() {
		isLoading = true;
		errorMsg = '';
		results = [];
		stopSpeaking();

		// Simulate "Deep Processing" delay for effect
		await new Promise((r) => setTimeout(r, 800));

		try {
			const response = await fetch('/api/diagnosis', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ symptoms: selectedSymptoms })
			});

			const data = await response.json();

			if (!response.ok) {
				// Use the specific error from server if available
				throw new Error(data.error || 'Diagnosis failed');
			}

			results = data;
			hasAnalyzed = true;

			// Save to History (Auto-log)
			if (results.length > 0) {
				HistoryService.save(results[0], 'Pasien Umum');
				// Trigger Voice
				speakResult(results[0]);
			}
		} catch (e: any) {
			// Show the actual error message to the user
			errorMsg = e.message || 'Neural Uplink Failed. Retry transmission.';
			console.error(e);
		} finally {
			isLoading = false;
		}
	}

	function reset() {
		stopSpeaking();
		selectedSymptoms = [];
		results = [];
		hasAnalyzed = false;
		errorMsg = '';
		dialogueScript = [];
	}

	function openHistory() {
		historyLogs = HistoryService.getAll();
		showHistory = true;
	}

	function selectLog(log: HistoryLog) {
		stopSpeaking();
		selectedHistoryItem.set(log.result);
		showHistory = false;
	}

	function handleExport(type: 'json' | 'text' | 'html') {
		if (!results[0]) return;

		// OOP IN ACTION: Factory creates the object, we just use it.
		const reportStrategy = ReportFactory.createReport(type);
		const data = reportStrategy.generate(results[0], 'Pasien Umum');
		const mimeType = reportStrategy.getType();

		// Browser download logic
		const blob = new Blob([data], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `sidia_report_${new Date().getTime()}.${type === 'text' ? 'txt' : type}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<!-- Page Header -->
<div class="p-8 flex flex-wrap justify-between items-end gap-6 relative z-10">
	<div class="space-y-2">
		<div class="flex items-center gap-2 text-noir-red text-xs font-bold uppercase tracking-widest">
			<span class="size-2 bg-noir-red rounded-full animate-pulse"></span>
			Analisis Langsung Aktif
		</div>
		<h1 class="text-4xl md:text-5xl font-black tracking-tighter text-white">
			Diagnosis AI:
			<span class="px-2 text-primary">{hasAnalyzed ? 'Analisis Selesai' : 'Siap Memindai'}</span>
		</h1>
		<p class="text-white/50 text-lg max-w-2xl">
			<strong class="text-white">SiDia (Sistem Diagnosis)</strong> mengerahkan
			<span class="text-primary font-semibold">Gemini Ultra</span>
			untuk analisis pemindaian saraf jaringan dalam.
			{#if hasAnalyzed}
				Arahkan kursor ke blok yang disensor untuk mengungkap intelijen.
			{:else}
				Inisialisasi penanda gejala untuk memulai pemindaian.
			{/if}
		</p>
	</div>

	<!-- Top Controls -->
	<div class="flex items-center gap-4">
		<!-- View Toggle -->
		{#if !hasAnalyzed}
			<div class="bg-black/40 rounded-full p-1 border border-white/10 flex">
				<button
					class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all {viewMode ===
					'list'
						? 'bg-primary text-white shadow-[0_0_15px_rgba(19,91,236,0.5)]'
						: 'text-white/40 hover:text-white'}"
					onclick={() => (viewMode = 'list')}
				>
					Terminal
				</button>
				<button
					class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all {viewMode ===
					'map'
						? 'bg-primary text-white shadow-[0_0_15px_rgba(19,91,236,0.5)]'
						: 'text-white/40 hover:text-white'}"
					onclick={() => (viewMode = 'map')}
				>
					Bio-Scan
				</button>
			</div>
		{/if}

		<!-- Voice Control Toggle -->
		<button
			class="size-12 rounded-full border border-white/10 hover:border-primary/50 bg-black/40 flex items-center justify-center transition-all group relative overflow-hidden cursor-pointer"
			onclick={() => {
				isVoiceEnabled = !isVoiceEnabled;
				if (!isVoiceEnabled) stopSpeaking();
			}}
			title={isVoiceEnabled ? 'Nonaktifkan Suara' : 'Aktifkan Suara'}
		>
			{#if isSpeaking}
				<span class="absolute inset-0 bg-primary/20 animate-pulse"></span>
			{/if}
			<span
				class="material-symbols-outlined text-white/80 group-hover:text-primary transition-colors relative z-10 select-none"
			>
				{isVoiceEnabled ? (isSpeaking ? 'record_voice_over' : 'volume_up') : 'volume_off'}
			</span>
		</button>
	</div>
</div>

<!-- ERROR ALERT BANNER -->
{#if errorMsg}
	<div class="px-8 pb-4 relative z-50 flex justify-center" transition:fly={{ y: -20 }}>
		<div
			class="bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.3)] max-w-2xl w-full backdrop-blur-md"
		>
			<span class="material-symbols-outlined text-red-500 text-3xl animate-pulse">warning</span>
			<div class="flex-1">
				<h4 class="font-bold uppercase text-xs tracking-widest text-red-500 mb-1">
					System Critical Failure
				</h4>
				<p class="text-sm font-mono">{errorMsg}</p>
			</div>
			<button
				class="p-2 hover:bg-red-500/20 rounded-full transition-colors"
				onclick={() => (errorMsg = '')}
			>
				<span class="material-symbols-outlined text-sm">close</span>
			</button>
		</div>
	</div>
{/if}

<!-- Diagnostic Main View -->

<div class="px-8 pb-8 flex flex-col relative z-10 flex-1 max-w-4xl mx-auto w-full">
	<!-- Content Area (Input OR Results) -->
	<div class="w-full space-y-8">
		<div class="glass-panel rounded-2xl overflow-hidden p-8 min-h-[500px] flex flex-col">
			<div class="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
				<div
					class="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary"
				>
					<span class="material-symbols-outlined">clinical_notes</span>
				</div>
				<div>
					<h3 class="text-xl font-bold">
						{hasAnalyzed
							? 'Analisis Klaster Gejala'
							: viewMode === 'map'
								? 'Pemindaian Biometrik'
								: 'Input Berkas Pasien'}
					</h3>
					<p class="text-white/40 text-sm italic">
						{hasAnalyzed
							? 'Sorot sensor untuk memeriksa.'
							: viewMode === 'map'
								? 'Pilih zona tubuh untuk identifikasi gejala.'
								: 'Masukkan anomali yang diamati untuk analisis.'}
					</p>
				</div>
				<div class="ml-auto">
					<button
						class="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-primary transition-all text-sm font-bold uppercase tracking-wider flex items-center gap-2"
						onclick={openHistory}
					>
						<span class="material-symbols-outlined text-lg">history</span>
						<span class="hidden sm:inline">Riwayat</span>
					</button>
				</div>
			</div>

			{#if !hasAnalyzed}
				<!-- INPUT MODE -->
				<div class="space-y-6 flex-1 flex flex-col" in:fade>
					{#if viewMode === 'list'}
						<!-- LIST MODE -->
						<div class="relative" in:fade>
							<span class="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-mono text-sm"
								>></span
							>
							<input
								bind:value={inputQuery}
								onkeydown={handleInputKeydown}
								type="text"
								placeholder="TERMINAL_INPUT: Ketik gejala dan tekan ENTER..."
								class="w-full bg-black/50 border border-white/20 rounded-xl px-10 py-4 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 font-mono transition-all"
							/>
						</div>
					{:else}
						<!-- MAP MODE -->
						<div class="flex flex-col md:flex-row gap-8 items-center md:items-start" in:fade>
							<!-- Body Map -->
							<div class="shrink-0">
								<BodyMap selectedPart={selectedBodyPart} on:select={handleBodyPartSelect} />
								<p
									class="text-center text-xs text-white/30 mt-4 font-mono uppercase tracking-widest"
								>
									Zona Aktif: {selectedBodyPart || 'Menunggu Input'}
								</p>
							</div>

							<!-- Contextual Symptoms -->
							<div class="flex-1 space-y-4 w-full">
								{#if selectedBodyPart}
									<h4
										class="text-sm font-bold text-primary uppercase tracking-widest border-b border-white/10 pb-2"
									>
										Gejala Terdeteksi: {selectedBodyPart}
									</h4>
									<div class="grid grid-cols-2 gap-2">
										{#each symptomCategories[selectedBodyPart] || [] as sym}
											{@const isSelected = selectedSymptoms.includes(sym)}
											<button
												class="text-left px-4 py-3 rounded-lg border transition-all text-sm flex items-center gap-2 cursor-pointer
                                                 {isSelected
													? 'bg-primary/20 border-primary text-white'
													: 'bg-white/5 border-transparent text-white/60 hover:text-primary hover:border-primary/30'}"
												onclick={() => toggleSymptom(sym)}
											>
												<span class="material-symbols-outlined text-xs">
													{isSelected ? 'check_box' : 'check_box_outline_blank'}
												</span>
												{sym}
											</button>
										{/each}
									</div>
								{:else}
									<div
										class="h-full flex items-center justify-center text-white/20 text-sm italic border-2 border-dashed border-white/5 rounded-xl p-8"
									>
										Klik area tubuh untuk menampilkan opsi gejala spesifik.
									</div>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Selected Symptoms Tag Cloud -->
					<div class="flex flex-wrap gap-2 pt-4 border-t border-white/5">
						<span class="text-xs font-bold text-white/30 uppercase tracking-widest py-1.5 mr-2"
							>Buffer Data:</span
						>
						{#each selectedSymptoms as symptom}
							<button
								class="px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/50 text-white text-sm font-medium hover:bg-noir-red/20 hover:border-noir-red/50 hover:text-noir-red transition-all flex items-center gap-2 group"
								onclick={() => toggleSymptom(symptom)}
							>
								{symptom}
								<span class="material-symbols-outlined text-[10px] group-hover:block hidden"
									>close</span
								>
							</button>
						{/each}
						{#if selectedSymptoms.length === 0}
							<span class="text-sm text-white/20 py-1.5 italic">Kosong...</span>
						{/if}
					</div>

					{#if viewMode === 'list'}
						<div
							class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4 opacity-70 hover:opacity-100 transition-opacity"
						>
							{#each allSymptoms
								.filter((s) => !selectedSymptoms.includes(s))
								.slice(0, 12) as suggestion}
								<button
									class="text-left px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 hover:text-primary border border-transparent hover:border-primary/30 transition-all cursor-pointer"
									onclick={() => toggleSymptom(suggestion)}
								>
									+ {suggestion}
								</button>
							{/each}
						</div>
					{/if}

					<div class="mt-auto pt-6 flex justify-end gap-4">
						{#if selectedSymptoms.length > 0}
							<button
								class="px-6 py-3 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-wider"
								onclick={clearSelection}
							>
								Hapus Data
							</button>
						{/if}
						<button
							class="px-8 py-3 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed
                            text-white rounded-lg font-bold shadow-[0_0_20px_rgba(19,91,236,0.5)] hover:shadow-[0_0_30px_rgba(19,91,236,0.8)]
                            transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest flex items-center gap-2 cursor-pointer"
							onclick={handleDiagnose}
							disabled={selectedSymptoms.length === 0 || isLoading}
						>
							{#if isLoading}
								<span
									class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
								></span>
								Memproses...
							{:else}
								<span class="material-symbols-outlined text-sm">neurology</span>
								Mulai Pindai
							{/if}
						</button>
					</div>
				</div>
			{:else}
				<!-- RESULTS MODE -->
				<div class="space-y-8" in:fade>
					{#if results.length > 0}
						<!-- Primary Result -->
						<div class="space-y-6 text-lg leading-relaxed">
							<div class="border-b border-white/10 pb-4 mb-4">
								<h2 class="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
									{results[0].disease?.name}
								</h2>
								<span class="text-primary font-mono text-sm tracking-widest uppercase">
									>> TERIDENTIFIKASI POSITIF
								</span>
							</div>

							<p>
								Subjek menunjukkan gejala akut
								{#each selectedSymptoms.slice(0, 3) as s, i}
									<span class="text-white font-bold mx-1">{s}</span>{i < 2 ? ',' : ''}
								{/each}
								yang terlokalisasi dalam sistem biologis. Pencitraan awal menyarankan
								<span
									class="text-white font-bold decoration-noir-red underline decoration-2 underline-offset-4"
								>
									{results[0].disease?.name}
								</span>
								berdasarkan {results[0].matchCount} penanda saraf yang cocok.
							</p>

							<!-- Dialogue Script (Visual Feedback for Voice) -->
							{#if dialogueScript.length > 0}
								<div class="bg-black/30 border border-white/10 rounded-xl p-4 my-6 space-y-3">
									<h4
										class="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2 mb-2"
									>
										Transkripsi Audio
									</h4>
									{#each dialogueScript as line, i}
										<div
											class="flex gap-3 text-sm {i === currentDialogueIndex
												? 'opacity-100'
												: 'opacity-50'} transition-opacity duration-300"
										>
											<span
												class="font-bold uppercase text-[10px] tracking-wider w-12 shrink-0 py-1
                                                {line.role === 'AI'
													? 'text-primary'
													: 'text-emerald-400'}"
											>
												{line.role}:
											</span>
											<p class="text-white/80">{line.text}</p>
										</div>
									{/each}
								</div>
							{/if}

							<!-- Description -->
							<div
								class="bg-white/5 p-4 rounded-lg border-l-2 border-white/20 italic text-white/70 text-base mb-6"
							>
								"{results[0].disease?.description || 'Tidak ada data intelijen tambahan.'}"
							</div>

							<div class="pl-6 border-l-2 border-primary/30 space-y-4 py-2 text-base">
								<div class="flex items-start gap-4">
									<div class="size-2 rounded-full bg-noir-red mt-2.5 shrink-0"></div>
									<p class="text-white/80">
										Gejala Cocok:
										{#if results[0].disease?.matchedSymptoms}
											{#each results[0].disease.matchedSymptoms as sym}
												<span
													class="inline-block px-2 py-0.5 mx-1 bg-noir-red/20 text-noir-red text-xs rounded border border-noir-red/30"
													>{sym}</span
												>
											{/each}
										{/if}
									</p>
								</div>
								<div class="flex items-start gap-4">
									<div class="size-2 rounded-full bg-primary mt-2.5 shrink-0"></div>
									<p class="text-white/80">
										Tingkat Keyakinan:
										<span class="text-primary font-bold">
											{Math.round((results[0].matchCount / results[0].totalSymptoms) * 100)}%
										</span>
									</p>
								</div>
							</div>

							<!-- Neural Interrogation (Follow-up) -->
							{#if results[0].disease?.allSymptoms}
								{@const matched = results[0].disease.matchedSymptoms || []}
								{@const candidates = results[0].disease.allSymptoms.filter(
									(s) => !matched.includes(s)
								)}

								{#if candidates.length > 0}
									<div class="bg-primary/10 border border-primary/30 rounded-xl p-6 space-y-4 mt-6">
										<h4
											class="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2"
										>
											<span class="material-symbols-outlined text-sm">psychology_alt</span>
											Interogasi Saraf (Verifikasi Lanjutan)
										</h4>
										<p class="text-sm text-white/70">
											Untuk meningkatkan kepastian diagnosis, konfirmasi keberadaan anomali berikut:
										</p>
										<div class="flex flex-wrap gap-2">
											{#each candidates as ms}
												{@const isSelected = selectedSymptoms.includes(ms)}
												<button
													class="px-3 py-1.5 rounded-lg border transition-all text-sm flex items-center gap-2 cursor-pointer {isSelected
														? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(19,91,236,0.5)]'
														: 'border-white/10 hover:border-primary/50 text-white/60 hover:text-white hover:bg-primary/20'}"
													onclick={() => toggleSymptom(ms)}
												>
													<span class="material-symbols-outlined text-xs"
														>{isSelected ? 'check_circle' : 'add_circle'}</span
													>
													{ms}
												</button>
											{/each}
										</div>
										<button
											class="w-full mt-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
											onclick={handleDiagnose}
										>
											<span class="material-symbols-outlined text-sm">neurology</span>
											Perbarui Analisis
										</button>
									</div>
								{/if}
							{/if}

							<div class="bg-black/40 rounded-xl p-6 border border-white/5 mt-6">
								<h4
									class="text-sm font-bold text-white/60 uppercase mb-4 tracking-widest flex items-center gap-2"
								>
									Wawasan AI SiDia
									<span class="h-px flex-1 bg-white/10"></span>
								</h4>
								<div class="flex gap-4">
									<span class="material-symbols-outlined text-primary mt-1">auto_awesome</span>
									<p class="text-sm text-white/90 leading-relaxed italic">
										"Menganalisis klaster gejala... Protokol perawatan yang diminta menyarankan:
										<span class="text-primary/90">
											{results[0].disease?.advice}
										</span>. Implementasi segera direkomendasikan."
									</p>
								</div>
							</div>
						</div>

						<!-- Secondary Matches (Collapsed or list) -->
						{#if results.length > 1}
							<div class="pt-8 border-t border-white/10">
								<h4 class="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
									Vektor Alternatif
								</h4>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									{#each results.slice(1, 3) as res}
										<div
											class="bg-white/5 p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
										>
											<div class="flex justify-between mb-2">
												<span class="font-bold text-white/80">{res.disease?.name}</span>
												<span class="text-xs bg-white/10 px-2 py-1 rounded text-white/60"
													>{Math.round((res.matchCount / res.totalSymptoms) * 100)}%</span
												>
											</div>
											<p class="text-xs text-white/40 truncate">{res.matchCount} matched markers</p>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					{:else if isLoading}
						<!-- Re-analyzing Loading State -->
						<div class="flex flex-col items-center justify-center h-64 text-white/40 animate-pulse">
							<span class="material-symbols-outlined text-4xl mb-4 animate-spin">neurology</span>
							<p>Memproses ulang data saraf...</p>
						</div>
					{:else}
						<!-- No Results -->
						<div class="flex flex-col items-center justify-center h-64 text-white/40">
							<span class="material-symbols-outlined text-4xl mb-4">search_off</span>
							<p>Tidak ditemukan profil biologis yang cocok di basis data.</p>
						</div>
					{/if}

					{#if results.length > 0}
						<!-- EXPORT FACTORY UI -->
						<div class="pt-6 border-t border-white/10 mt-6">
							<h4
								class="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex justify-between items-center"
							>
								<span>Export (Factory Pattern)</span>
								<span class="text-[10px] bg-white/5 px-2 py-1 rounded text-white/30 font-mono"
									>IReport[]</span
								>
							</h4>
							<div class="grid grid-cols-3 gap-3">
								<button
									onclick={() => handleExport('json')}
									class="flex flex-col items-center justify-center p-3 rounded-lg bg-black/40 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all text-xs text-white/60 hover:text-white gap-2 cursor-pointer"
								>
									<span class="material-symbols-outlined text-lg">data_object</span>
									JSON
								</button>
								<button
									onclick={() => handleExport('text')}
									class="flex flex-col items-center justify-center p-3 rounded-lg bg-black/40 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all text-xs text-white/60 hover:text-white gap-2 cursor-pointer"
								>
									<span class="material-symbols-outlined text-lg">description</span>
									TXT
								</button>
								<button
									onclick={() => handleExport('html')}
									class="flex flex-col items-center justify-center p-3 rounded-lg bg-black/40 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all text-xs text-white/60 hover:text-white gap-2 cursor-pointer"
									title="Printable Format"
								>
									<span class="material-symbols-outlined text-lg">print</span>
									HTML
								</button>
							</div>
						</div>
					{/if}

					<button
						onclick={reset}
						class="w-full mt-6 py-4 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer"
					>
						<span class="material-symbols-outlined text-sm">restart_alt</span>
						Reset Berkas Kasus
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

{#if showHistory}
	<div
		class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
		transition:fade
	>
		<div
			class="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10"
			transition:fly={{ y: 20 }}
		>
			<div class="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
				<h3 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="material-symbols-outlined text-primary">history</span>
					Riwayat Diagnosis
				</h3>
				<button
					class="size-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
					onclick={() => (showHistory = false)}
				>
					<span class="material-symbols-outlined">close</span>
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-6 space-y-4">
				{#if historyLogs.length === 0}
					<div class="text-center py-12 text-white/40 italic">Belum ada riwayat tersimpan.</div>
				{:else}
					{#each historyLogs as log}
						<button
							class="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden"
							onclick={() => selectLog(log)}
						>
							<div class="flex justify-between items-start mb-2">
								<span
									class="font-bold text-lg text-white group-hover:text-primary transition-colors"
								>
									{log.result.disease?.name || 'Diagnosis Unknown'}
								</span>
								<span class="text-xs font-mono text-white/40 bg-black/30 px-2 py-1 rounded">
									{new Date(log.timestamp).toLocaleString('id-ID')}
								</span>
							</div>
							<p class="text-sm text-white/60 line-clamp-2 pr-8">
								{log.result.disease?.matchedSymptoms?.join(', ') || 'Tidak ada gejala tercatat.'}
							</p>
							<div class="mt-2 text-xs text-primary/60 uppercase tracking-widest font-mono">
								Match: {log.result.matchCount} / {log.result.totalSymptoms}
							</div>
						</button>
					{/each}
				{/if}
			</div>

			<div class="p-4 border-t border-white/10 bg-black/40 text-right">
				<button
					class="text-xs text-red-400 hover:text-red-300 px-4 py-2 hover:bg-red-500/10 rounded transition-colors"
					onclick={() => {
						if (confirm('Hapus semua riwayat?')) {
							HistoryService.clear();
							historyLogs = [];
						}
					}}
				>
					HAPUS SEMUA
				</button>
			</div>
		</div>
	</div>
{/if}
