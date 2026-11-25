export const WEDDING = {
  bride: "Samicha",
  groom: "Fabrice",
  title: "Samicha & Fabrice",
  dates: "Du vendredi 25 au dimanche 27 juin 2027",
  shortDates: "25 – 27 juin 2027",
  venue: "Mas de Coulet",
  town: "34190 Brissac",
  timeZone: "Europe/Paris",
  /** Default reveal moment: Sunday brunch. The couple can change it in /maries. */
  defaultRevealAt: "2027-06-27T11:00:00+02:00",
} as const;

export const LIMITS = {
  maxPhotosPerGuest: 600,
  maxUploadBytes: 15 * 1024 * 1024,
  fullSize: 2560,
  thumbSize: 640,
} as const;
