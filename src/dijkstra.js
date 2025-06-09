export function dijkstraSimple(graph, start) {
    const dist = Array(6).fill(Infinity);
    const prev = Array(6).fill(null);
    const visited = Array(6).fill(false);
    dist[start] = 0;

    for (let i = 0; i < 6; i++) {
        let u = -1;
        for (let j = 0; j < 6; j++) {
            if (!visited[j] && (u === -1 || dist[j] < dist[u])) u = j;
        }
        if (dist[u] === Infinity) break;
        visited[u] = true;

        graph.forEach(([a, b, w]) => {
            if (a === u && dist[b] > dist[a] + w) {
                dist[b] = dist[a] + w;
                prev[b] = a;
            }
            if (b === u && dist[a] > dist[b] + w) {
                dist[a] = dist[b] + w;
                prev[a] = b;
            }
        });
    }
    return { dist, prev };
}