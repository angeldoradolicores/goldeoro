import os

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to replace .single() with .maybeSingle() but only when it's part of a .from('profiles') query.
    # A simple regex might be hard, let's just do a string replacement if .from('profiles') is in the file.
    # Actually, we can just replace .single() with .maybeSingle() for the specific lines.
    
    lines = content.split('\n')
    for i in range(len(lines)):
        if ".from('profiles')" in lines[i] or "from('profiles')" in lines[i]:
            # Look ahead up to 10 lines for .single()
            for j in range(i, min(i+10, len(lines))):
                if ".single()" in lines[j]:
                    lines[j] = lines[j].replace(".single()", ".maybeSingle()")
                    break
    
    new_content = '\n'.join(lines)
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.next' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))

