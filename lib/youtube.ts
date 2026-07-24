const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

interface YouTubeVideo {
  id: string
  title: string
  duration: number
  publishedAt: string
  privacyStatus: string
  thumbnailUrl: string
}

interface YouTubeApiResponse {
  items: Array<{
    id: string
    snippet: {
      title: string
      publishedAt: string
      thumbnails: {
        default: { url: string }
        medium: { url: string }
      }
    }
    contentDetails: {
      duration: string
    }
    status: {
      privacyStatus: string
    }
  }>
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

export function normalizeYouTubeUrl(url: string): string | null {
  const videoId = extractVideoId(url)
  if (!videoId) return null
  return `https://www.youtube.com/watch?v=${videoId}`
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  return hours * 3600 + minutes * 60 + seconds
}

export async function getVideoMetadata(videoId: string): Promise<YouTubeVideo | null> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured')
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/videos')
  url.searchParams.set('part', 'snippet,contentDetails,status')
  url.searchParams.set('id', videoId)
  url.searchParams.set('key', YOUTUBE_API_KEY)

  const response = await fetch(url.toString())

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error?.error?.message || 'Failed to fetch video metadata')
  }

  const data: YouTubeApiResponse = await response.json()

  if (!data.items || data.items.length === 0) {
    return null
  }

  const item = data.items[0]

  return {
    id: item.id,
    title: item.snippet.title,
    duration: parseDuration(item.contentDetails.duration),
    publishedAt: item.snippet.publishedAt,
    privacyStatus: item.status.privacyStatus,
    thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
  }
}

export function validateVideo(video: YouTubeVideo): { valid: boolean; reason?: string } {
  if (video.privacyStatus !== 'public' && video.privacyStatus !== 'unlisted') {
    return { valid: false, reason: 'Video harus public atau unlisted' }
  }

  if (video.duration < 30) {
    return { valid: false, reason: `Video terlalu pendek (${video.duration}s, minimal 30s)` }
  }

  const publishedAt = new Date(video.publishedAt)
  const now = new Date()
  const hoursSincePublished = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60)

  if (hoursSincePublished > 24) {
    return { valid: false, reason: 'Video harus dipublish dalam 24 jam terakhir' }
  }

  return { valid: true }
}
