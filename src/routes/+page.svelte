<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { allSymptoms } from '$lib/data/diseases';
  import { analyzeSymptoms } from '$lib/services/diagnosis';
  import type { DiagnosisResult } from '$lib/types';

  let selectedSymptoms: string[] = $state([]);
  let results: DiagnosisResult[] = $state([]);
  let history: { date: Date, symptoms: string[], disease: string }[] = $state([]);
  let hasAnalyzed = $state(false);
  let isLoading = $state(false);
  let errorMsg = $state("");

  function toggleSymptom(symptom: string) {
    if (selectedSymptoms.includes(symptom)) {
      selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
    } else {
      selectedSymptoms = [...selectedSymptoms, symptom];
    }
    errorMsg = "";
  }

  function clearSelection() {
    selectedSymptoms = [];
    hasAnalyzed = false;
    errorMsg = "";
  }

  function clearHistory() {
    history = [];
  }

  async function handleDiagnose() {
    isLoading = true;
    errorMsg = "";
    results = [];
    
    try {
        const response = await fetch('/api/diagnosis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: selectedSymptoms })
        });

        if (!response.ok) throw new Error('Diagnosis failed');

        const data = await response.json();
        results = data;
        hasAnalyzed = true;

        // Add to history
        if (results.length > 0 && results[0].disease?.name) {
            history = [{
                date: new Date(),
                symptoms: [...selectedSymptoms],
                disease: results[0].disease.name
            }, ...history].slice(0, 10); // Keep last 10 entries
        }

    } catch (e) {
        errorMsg = "Gagal memproses diagnosa. Silakan coba lagi.";
        console.error(e);
    } finally {
        isLoading = false;
    }
  }

  function reset() {
    selectedSymptoms = [];
    results = [];
    hasAnalyzed = false;
    errorMsg = "";
  }
</script>

<div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
  <!-- Header -->
  <div class="text-center mb-12 space-y-4">
    <div class="inline-block p-1 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 mb-4">
        <div class="bg-gray-900 rounded-xl p-4">
            <h1 class="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
            SiDia AI
            </h1>
        </div>
    </div>
    <p class="text-xl text-gray-400 max-w-2xl mx-auto font-light">
      Sistem Diagnosa Penyakit Cerdas. Pilih gejala yang Anda rasakan untuk mendapatkan analisis awal.
    </p>
  </div>

  <div class="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
    
    <!-- Input Section -->
    <div class="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
      <h2 class="text-2xl font-semibold mb-6 flex items-center gap-3">
        <span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 text-sm">1</span>
        Pilih atau Ketik Gejala
      </h2>
      
      <!-- Manual Input -->
      <div class="mb-6 relative">
        <input 
            type="text" 
            placeholder="Ketik gejala lain (misal: pusing, mual)..." 
            class="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            onkeydown={(e) => {
                if(e.key === 'Enter') {
                    const val = e.currentTarget.value.trim();
                    if(val && !selectedSymptoms.includes(val)) {
                        toggleSymptom(val);
                        e.currentTarget.value = '';
                    }
                }
            }}
        />
        <span class="absolute left-3 top-3.5 text-gray-500">🔍</span>
      </div>

      <div class="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {#each allSymptoms as symptom}
          <button
            class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border
              {selectedSymptoms.includes(symptom)
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-600'}"
            onclick={() => toggleSymptom(symptom)}
          >
            {symptom}
          </button>
        {/each}
        
        <!-- Show custom symptoms that aren't in the predefined list -->
        {#each selectedSymptoms.filter(s => !allSymptoms.includes(s)) as customSymptom}
             <button
            class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border
             bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30"
            onclick={() => toggleSymptom(customSymptom)}
          >
            {customSymptom} ✖
          </button>
        {/each}
      </div>

      <div class="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center">
        <div class="flex items-center gap-4">
            <span class="text-sm text-gray-500">
                {selectedSymptoms.length} gejala dipilih
            </span>
            {#if selectedSymptoms.length > 0}
                <button 
                    onclick={clearSelection}
                    class="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                    Hapus Pilihan
                </button>
            {/if}
        </div>
        <button
            class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 
            text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all duration-300 
            transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={handleDiagnose}
            disabled={selectedSymptoms.length === 0 || isLoading}
        >
            {isLoading ? 'Menganalisa...' : 'Analisa Sekarang'}
        </button>
      </div>
      {#if errorMsg}
        <p class="mt-4 text-red-400 text-center text-sm">{errorMsg}</p>
      {/if}
    </div>

    <!-- Output Section -->
    <div class="space-y-6">
        {#if isLoading}
             <div class="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
                <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="text-gray-400 animate-pulse">Menghubungi AI Dokter...</p>
             </div>
        {:else if hasAnalyzed}
            <div in:fly={{ y: 20, duration: 600 }} class="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
                <h2 class="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 text-sm">2</span>
                    Hasil Analisa
                </h2>

                {#if results.length > 0}
                    <div class="space-y-4">
                        {#each results as result, i}
                            <div 
                                in:slide={{ duration: 400, delay: i * 100 }}
                                class="p-6 rounded-2xl border border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                            >
                                <div class="flex justify-between items-start mb-3">
                                    <h3 class="text-xl font-bold text-white">{result.disease?.name}</h3>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs text-gray-400 uppercase tracking-wider">Kecocokan</span>
                                        <span class="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold">
                                            {Math.round((result.matchCount / result.totalSymptoms) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="space-y-3">
                                    <div class="text-sm text-gray-400">
                                        <span class="text-gray-500">Gejala cocok:</span>
                                        <div class="flex flex-wrap gap-1 mt-1">
                                            {#each result.disease?.symptoms.filter(s => selectedSymptoms.includes(s)) as sym}
                                                <span class="text-green-400">{sym}</span>{#if sym !== result.disease?.symptoms.filter(s => selectedSymptoms.includes(s)).slice(-1)[0]}, {/if}
                                            {/each}
                                        </div>
                                    </div>
                                    
                                    <div class="mt-4 pt-4 border-t border-gray-700/50">
                                        <p class="text-sm font-medium text-purple-300">💡 Saran:</p>
                                        <p class="text-gray-300 mt-1">{result.disease?.advice}</p>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="text-center py-12">
                        <div class="text-6xl mb-4">🤔</div>
                        <h3 class="text-xl font-semibold text-white mb-2">Tidak ditemukan kecocokan</h3>
                        <p class="text-gray-400">
                            Kombinasi gejala yang Anda pilih tidak cocok dengan database penyakit kami. 
                            Mohon konsultasikan dengan dokter untuk diagnosa yang akurat.
                        </p>
                    </div>
                {/if}

                <button 
                    onclick={reset}
                    class="w-full mt-6 py-3 px-4 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors font-medium"
                >
                    Ulangi Diagnosa
                </button>
            </div>
        {:else}
            <!-- Empty State / Placeholder -->
            <div class="h-full flex flex-col items-center justify-center p-8 bg-gray-900/30 border border-gray-800/50 rounded-3xl border-dashed">
                <div class="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <span class="text-4xl">🩺</span>
                </div>
                <h3 class="text-xl font-medium text-gray-400 mb-2">Menunggu Input</h3>
                <p class="text-gray-500 text-center max-w-sm">
                    Silakan pilih gejala di panel sebelah kiri untuk melihat hasil diagnosa di sini.
                </p>
            </div>
        {/if}
    </div>
  </div>
  
  <!-- History Section -->
  {#if history.length > 0}
      <div class="w-full max-w-4xl mt-12 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-semibold flex items-center gap-3">
                  <span class="text-2xl">📜</span>
                  Riwayat Diagnosa
              </h2>
              <button 
                  onclick={clearHistory}
                  class="text-sm text-red-400 hover:text-red-300 px-3 py-1 rounded-lg hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
              >
                  Hapus Riwayat
              </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each history as item}
                  <div class="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 flex flex-col gap-2">
                      <div class="flex justify-between items-start">
                          <span class="font-bold text-blue-400">{item.disease}</span>
                          <span class="text-xs text-gray-500">{item.date.toLocaleTimeString('id-ID')}</span>
                      </div>
                      <p class="text-sm text-gray-400 truncate">
                          {item.symptoms.join(', ')}
                      </p>
                  </div>
              {/each}
          </div>
      </div>
  {/if}
</div>

<style>
    /* Custom scrollbar for symptom list */
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(75, 85, 99, 0.4);
        border-radius: 20px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(75, 85, 99, 0.6);
    }
</style>
