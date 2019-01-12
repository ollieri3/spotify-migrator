interface TransferProgress {
  downloads?: {
    library?: LoadingProgress,
    playlists?: LoadingProgress,
    artists?: LoadingProgress
  }
  downloadsAreComplete?: boolean
}

interface LoadingProgress {
  label?: string,
  itemsDownloaded?: [number, number],
  isComplete?: boolean,
}

export {
  TransferProgress,
  LoadingProgress
}
