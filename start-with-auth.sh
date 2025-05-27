#!/bin/bash

# Load environment variables
set -a
source .env
set +a

# Execute the original command
exec $@
