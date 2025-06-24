export function generateFileName(type: 'photo' | 'video'): string {
  const timestamp = Date.now();
  const uuid = Math.random().toString(36).substring(2, 9);
  const extension = type === 'photo' ? 'jpg' : 'mp4';
  return `${timestamp}-${uuid}.${extension}`;
}

export function getMediaType(uri: string): 'photo' | 'video' {
  const lowercaseUri = uri.toLowerCase();
  const videoExtensions = ['.mp4', '.mov', '.avi', '.m4v'];

  return videoExtensions.some((ext) => lowercaseUri.includes(ext)) ? 'video' : 'photo';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function isValidMediaUri(uri: string): boolean {
  return Boolean(
    uri && (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('http'))
  );
}
