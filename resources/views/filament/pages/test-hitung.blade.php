<x-filament-panels::page>
    <div class="space-y-6">
        <!-- Filter Card using Filament Section -->
        <x-filament::section>
            <x-slot name="heading">
                Filter Pencarian
            </x-slot>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <!-- Tanggal Awal -->
                <div class="space-y-2">
                    <label for="tgl_awal" class="text-sm font-medium text-gray-900 dark:text-white">Tanggal Awal</label>
                    <x-filament::input.wrapper>
                        <x-filament::input
                            type="datetime-local"
                            id="tgl_awal"
                            wire:model="tgl_awal"
                            step="1"
                        />
                    </x-filament::input.wrapper>
                </div>

                <!-- Tanggal Akhir -->
                <div class="space-y-2">
                    <label for="tgl_akhir" class="text-sm font-medium text-gray-900 dark:text-white">Tanggal Akhir</label>
                    <x-filament::input.wrapper>
                        <x-filament::input
                            type="datetime-local"
                            id="tgl_akhir"
                            wire:model="tgl_akhir"
                            step="1"
                        />
                    </x-filament::input.wrapper>
                </div>

                <!-- Ruangan -->
                <div class="space-y-2">
                    <label for="ruangan_id" class="text-sm font-medium text-gray-900 dark:text-white">Ruangan</label>
                    <x-filament::input.wrapper>
                        <x-filament::input.select id="ruangan_id" wire:model="ruangan_id">
                            <option value="">-- Semua Ruangan --</option>
                            @foreach($ruanganOptions as $id => $descripsi)
                                <option value="{{ $id }}">{{ $id }} - {{ $descripsi }}</option>
                            @endforeach
                        </x-filament::input.select>
                    </x-filament::input.wrapper>
                </div>

                <!-- Jaminan -->
                <div class="space-y-2">
                    <label for="jaminan_id" class="text-sm font-medium text-gray-900 dark:text-white">Jaminan</label>
                    <x-filament::input.wrapper>
                        <x-filament::input.select id="jaminan_id" wire:model="jaminan_id">
                            <option value="">-- Semua Jaminan --</option>
                            <option value="1">Non-JKN (1)</option>
                            <option value="2">JKN (2)</option>
                        </x-filament::input.select>
                    </x-filament::input.wrapper>
                </div>
            </div>

            <!-- Action Button -->
            <div class="flex justify-end gap-3 mt-6">
                <x-filament::button wire:click="search" color="primary">
                    Cari Data
                </x-filament::button>
            </div>
        </x-filament::section>

        <!-- Filament Table Builder -->
        <div class="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            {{ $this->table }}
        </div>
    </div>
</x-filament-panels::page>
