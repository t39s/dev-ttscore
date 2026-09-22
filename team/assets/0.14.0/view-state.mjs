export function shouldShowCurrentOperationalLiveLinks(mode) {
  return mode !== "view";
}

export function canOpenCurrentMatchFromView({ mode, source, authenticated, lifecycle, currentMatch }) {
  return mode === "view"
    && source === "firebase"
    && authenticated === true
    && lifecycle === "active"
    && currentMatch?.status === "current";
}

export function shouldShowPermanentTeamLiveInView({ mode, source }) {
  return mode === "view" && source === "firebase";
}
