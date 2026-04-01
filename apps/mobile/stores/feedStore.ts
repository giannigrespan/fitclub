import { create } from 'zustand'
import { supabase, Performance } from '../lib/supabase'

type FeedState = {
  items: Performance[]
  isLoading: boolean
  hasMore: boolean
  page: number

  fetchFeed: (reset?: boolean) => Promise<void>
}

const PAGE_SIZE = 20

export const useFeedStore = create<FeedState>((set, get) => ({
  items: [],
  isLoading: false,
  hasMore: true,
  page: 0,

  fetchFeed: async (reset = false) => {
    const { isLoading, page, hasMore } = get()
    if (isLoading || (!reset && !hasMore)) return

    set({ isLoading: true })
    const currentPage = reset ? 0 : page

    const { data, error } = await supabase
      .from('performances')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

    if (!error && data) {
      set((s) => ({
        items: reset ? data : [...s.items, ...data],
        page: currentPage + 1,
        hasMore: data.length === PAGE_SIZE,
        isLoading: false,
      }))
    } else {
      set({ isLoading: false })
    }
  },
}))
