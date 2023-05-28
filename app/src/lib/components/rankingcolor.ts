export function getRankingColor(ranking: number): any {
  if (ranking > 2000) {
    return "rgb(240,230,140)";
  } else if (ranking > 500) {
    return "rgb(0,128,0,1)";
  } else if (ranking > 0) {
    return "rgb(255,255,255,0.7)";
  } else {
    return "rgb(255,0,0,0.5)";
  }
}