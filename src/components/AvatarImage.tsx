import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sword } from "lucide-react";

interface AvatarImageProps {
  src?: string;
  alt: string;
  className?: string;
}

const AvatarImage = ({ src, alt, className = "" }: AvatarImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`rounded-lg border border-gold/50 bg-background/50 flex items-center justify-center flex-shrink-0 ${className}`}>
        <Sword className="w-6 h-6 text-gold/50" />
      </div>
    );
  }

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {loading && (
        <Skeleton className="absolute inset-0 rounded-lg" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full rounded-lg border border-gold object-cover ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
};

export default AvatarImage;
