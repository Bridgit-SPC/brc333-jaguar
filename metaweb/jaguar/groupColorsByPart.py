import re
import json

# Function to parse part coordinates
def parse_part_coordinates(file_path):
    coordinates_dict = {}
    with open(file_path, 'r') as file:
        for line in file:
            key, coords_string = line.split(':', 1)
            key = key.strip('"').strip()

            # Manually parsing the coordinates
            coords_list = []
            coords_string = coords_string.strip().strip(',\n').strip('[]')
            for coord in coords_string.split('],['):
                coords = coord.split(',')
                if len(coords) == 2:
                    x, y = coords
                    coords_list.append((int(x), int(y)))

            coordinates_dict[key] = coords_list
    return coordinates_dict

# Function to parse color coordinates
def parse_color_coordinates(file_path):
    coordinates_dict = {}
    with open(file_path, 'r') as file:
        for line in file:
            key, coords_string = line.split(":", 1)
            key = key.strip().strip('"')

            coords_list = re.findall(r'\[(\d+), (\d+)\]', coords_string)
            coordinates_dict[key] = [(int(x), int(y)) for x, y in coords_list]
    
    return coordinates_dict

def aggregate_colors(part_coords, color_coords):
    aggregated_data = {}

    for part, part_coord in part_coords.items():
        part_data = {}

        for color, color_coord in color_coords.items():
            common_coords = [coord for coord in part_coord if coord in color_coord]

            if common_coords:
                part_data[color] = common_coords
        
        if part_data:
            aggregated_data[part] = part_data

    return aggregated_data

def write_to_file(data, output_file):
    with open(output_file, 'w') as file:
        file.write("{\n")
        parts = list(data.keys())
        for i, part in enumerate(parts):
            file.write(f'    "{part}": {{\n')
            colors = list(data[part].keys())
            for j, color in enumerate(colors):
                coords = ", ".join([f"[{x}, {y}]" for x, y in data[part][color]])
                file.write(f'        "{color}": [{coords}]')
                if j < len(colors) - 1:
                    file.write(",\n")
            file.write("\n    }")
            if i < len(parts) - 1:
                file.write(",\n")
        file.write("\n}")

# Example usage
part_coords = parse_part_coordinates('./coordinates/part_coordinates.txt')
color_coords = parse_color_coordinates('./coordinates/jaguar_coordinates.txt')

# Debugging: Print concise snippets of both sets of coordinates
print("Part Coordinates Snippet:", {k: part_coords[k][:5] for k in list(part_coords)[:2]})
print("Color Coordinates Snippet:", {k: color_coords[k][:5] for k in list(color_coords)[:2]})

aggregated_data = aggregate_colors(part_coords, color_coords)

# Print the aggregated data in a concise format
print("Aggregated Data (Snippet):", {k: aggregated_data[k] for k in list(aggregated_data)[:2]})

# Write aggregated data to file
output_file_path = './output.json'
write_to_file(aggregated_data, output_file_path)