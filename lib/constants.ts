export const CATEGORIES = {
  memory: [
    { value: "date", label: "Date" },
    { value: "trip", label: "Trip" },
    { value: "food", label: "Food" },
    { value: "random", label: "Random" },
    { value: "celebration", label: "Celebration" },
    { value: "special_moment", label: "Special Moment" },
  ],
  bucket: [
    { value: "travel", label: "Travel" },
    { value: "food", label: "Food" },
    { value: "experience", label: "Experience" },
    { value: "milestone", label: "Milestone" },
    { value: "learning", label: "Learning Together" },
    { value: "home", label: "Home & Living" },
    { value: "other", label: "Other" },
  ],
  future: [
    { value: "dream", label: "Dream" },
    { value: "goal", label: "Goal" },
    { value: "place", label: "Place to Visit" },
    { value: "promise", label: "Promise" },
    { value: "letter", label: "Letter to Future" },
    { value: "other", label: "Other" },
  ],
} as const;

export const MOODS = [
  { value: "happy", label: "Happy", emoji: "😊", color: "bg-amber-100" },
  { value: "loved", label: "Loved", emoji: "🥰", color: "bg-rose-100" },
  { value: "good", label: "Good", emoji: "🙂", color: "bg-emerald-100" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "bg-stone-100" },
  { value: "tired", label: "Tired", emoji: "😴", color: "bg-indigo-100" },
  { value: "sad", label: "Sad", emoji: "😢", color: "bg-sky-100" },
  { value: "angry", label: "Angry", emoji: "😠", color: "bg-red-100" },
] as const;

export const OPEN_WHEN_TAGS = [
  { value: "when_you_miss_me", label: "When you miss me" },
  { value: "when_you_are_sad", label: "When you are sad" },
  { value: "when_you_are_happy", label: "When you are happy" },
  { value: "when_we_fight", label: "When we fight" },
  { value: "when_you_need_a_reminder", label: "When you need a reminder" },
  { value: "when_its_raining", label: "When it's raining" },
  { value: "when_you_cant_sleep", label: "When you can't sleep" },
] as const;

export const TIMELINE_PRESETS = [
  "First Meet",
  "First Date",
  "First Kiss",
  "First Trip",
  "Anniversary",
  "Moved In Together",
  "Engagement",
  "Wedding",
  "First Pet",
  "Custom",
] as const;

export const ROMANTIC_MESSAGES = [
  "Hari ini adalah bab baru dari cerita kita.",
  "Bersamamu, hal sederhana terasa istimewa.",
  "Setiap hari bersamamu adalah hadiah.",
  "Aku bersyukur kamu ada di sisi ini.",
  "Langkah kecil kita hari ini, jejak besar untuk esok.",
  "Cintamu adalah rumah ternyaman yang pernah kutahu.",
  "Mari simpan satu kenangan lagi hari ini.",
  "Waktu berhenti indahnya ketika aku bersamamu.",
] as const;