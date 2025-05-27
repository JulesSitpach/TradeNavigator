
#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    # Use a more robust method to load environment variables
    set -a
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]]; then
            # Handle quoted values properly
            if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
                key="${BASH_REMATCH[1]}"
                value="${BASH_REMATCH[2]}"
                # Remove quotes if present
                value="${value#\"}"
                value="${value%\"}"
                value="${value#\'}"
                value="${value%\'}"
                export "$key=$value"
            fi
        fi
    done < .env
    set +a
fi

# Execute the original command
exec "$@"
