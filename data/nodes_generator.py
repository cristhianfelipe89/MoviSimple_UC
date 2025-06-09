import json
import random
import os

# Número total de nodos
num_nodes = 6

# Lista para almacenar las conexiones únicas
edges = []
existing_edges = set()  # Para verificar duplicados (u, v)

while len(edges) < 9:
    u, v = sorted(random.sample(range(num_nodes), 2))  # Asegurar que u ≠ v y ordenarlos
    if (u, v) not in existing_edges:
        w = random.randint(1, 15)  # Peso aleatorio entre 1 y 15
        edges.append([u, v, w])
        existing_edges.add((u, v))

# Obtener la ruta del script actual y generar el archivo en la misma carpeta
script_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(script_dir, "edges.json")

# Guardar los datos en el archivo JSON
with open(file_path, "w") as json_file:
    json.dump(edges, json_file, indent=4)

print(f"Archivo edges.json generado correctamente en: {file_path}")