"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RatingSelectProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
  disabled?: boolean;
};

const RATING_OPTIONS = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1];

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className="flex gap-0.5 items-center">
      {[...Array(fullStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={faStar}
          className="w-4 h-4 text-yellow-400"
        />
      ))}
      {hasHalfStar && (
        <FontAwesomeIcon
          icon={faStarHalfAlt}
          className="w-4 h-4 text-yellow-400"
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={faStar}
          className="w-4 h-4 text-muted-foreground opacity-30"
        />
      ))}
    </div>
  );
};

export function RatingSelect({ value, onChange, error, disabled }: RatingSelectProps) {
  return (
    <div className="space-y-2">
      <Select
        value={value?.toString() || ""}
        onValueChange={(val) => onChange(val ? parseFloat(val) : null)}
        disabled={disabled}
      >
        <SelectTrigger 
          className={`bg-input-background !shadow-[0px_2px_2px_0px_rgba(16,17,26,0.05)] dark:!shadow-[0px_1px_1px_0px_rgba(255,255,255,0.05)] hover:!shadow-[0px_4px_4px_0px_rgba(16,17,26,0.05)] dark:hover:!shadow-[0px_2px_2px_0px_rgba(255,255,255,0.05)] ${error ? "border-destructive" : ""}`}
        >
          <SelectValue placeholder="Select a rating">
            {value ? (
              <div className="flex items-center gap-2">
                <StarRating rating={value} />
                <span className="text-sm text-muted-foreground">({value})</span>
              </div>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {RATING_OPTIONS.map((rating) => (
            <SelectItem key={rating} value={rating.toString()}>
              <div className="flex items-center gap-2">
                <StarRating rating={rating} />
                <span className="text-sm text-muted-foreground">({rating})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
