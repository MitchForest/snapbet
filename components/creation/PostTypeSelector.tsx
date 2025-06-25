import { PostType } from '@/types/content';

interface PostTypeSelectorProps {
  selectedType: PostType;
  onTypeChange: (type: PostType) => void;
}

export function PostTypeSelector({
  selectedType: _type,
  onTypeChange: _onChange,
}: PostTypeSelectorProps) {
  // For now, just return null or show content type
  // Full selector will be implemented when we have all types
  return null;
}
