
#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    # Use a more robust method to load environment variables
    set -a
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]]; then
            # Handle quoted values properly
            if echo "$line" | grep -q "="; then
                key=$(echo "$line" | cut -d'=' -f1)
                value=$(echo "$line" | cut -d'=' -f2-)
                # Remove quotes if present
                value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']$//')
                export "$key=$value"
            fi
        fi
    done < .env
    set +a
fi

# Execute the original command
exec "$@"
