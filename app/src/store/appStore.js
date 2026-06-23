import { create } from 'zustand';

const useAppStore = create((set) => ({
  selectedCategory: null,
  selectedStatus: null,
  searchQuery: '',
  mapCenter: { lat: 23.0225, lng: 72.5714 },
  filtersOpen: false,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMapCenter: (center) => set({ mapCenter: center }),
  toggleFilters: () => set((s) => ({ filtersOpen: !s.filtersOpen })),
  resetFilters: () => set({ selectedCategory: null, selectedStatus: null, searchQuery: '' })
}));

export default useAppStore;
