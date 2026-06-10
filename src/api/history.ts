import api from './axios'

export interface HistorySession {
  id: number
  user_id: number
  created_at: string
  gram_result: string
  gram_confidence: string
  final_bacteria_name: string
  final_bacteria_id: number | null
  biochemical_tags: string
  sample_image_url: string | null
  path_image_url: string | null
  overridden: boolean
  status: string
}

export interface SaveSessionPayload {
  gram_result: string
  gram_confidence: string
  final_bacteria_name: string
  final_bacteria_id: number | null
  biochemical_tags: string
  overridden: boolean
  sample_image_url: string
  svg_content: string
}

export interface PaginatedHistory {
  total: number
  page: number
  limit: number
  total_pages: number
  sessions: HistorySession[]
}

export const saveSession   = (payload: SaveSessionPayload) => api.post<HistorySession>('/api/sessions', payload)
export const getHistory    = (page = 1, limit = 8)         => api.get<PaginatedHistory>('/api/history', { params: { page, limit } })
export const getSession    = (id: number)                  => api.get<HistorySession>(`/api/sessions/${id}`)
export const deleteSession = (id: number)                  => api.delete(`/api/sessions/${id}`)
