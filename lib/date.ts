
export function formatRelativeDate(date: Date): string {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Il y a 1 jour";
    if (days < 7) return `Il y a ${days} jours`;

    const weeks = Math.floor(days / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
}
