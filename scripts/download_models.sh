#!/usr/bin/env bash
# download_models.sh
#
# Template script to set up the model directory structure on a new server.
# The actual model files are NOT distributed via Git due to size.
# Obtain the model archive from the project team, then run this script.
#
# Usage:
#   1. Place the extracted model files in a staging directory.
#   2. Update the SOURCE_DIR variable below.
#   3. Run: bash scripts/download_models.sh

set -e

# ── Configuration ─────────────────────────────────────────────
INSTALL_DIR="/opt/fakesitehunter"
# SOURCE_DIR="$HOME/Downloads/FakeSite_Engine1_API"  # Update this

# ── Create directory structure ────────────────────────────────
echo "Creating directory structure at $INSTALL_DIR..."

mkdir -p "$INSTALL_DIR/models/Engine 1/models"
mkdir -p "$INSTALL_DIR/models/Engine 1/data"
mkdir -p "$INSTALL_DIR/models/Engine 2"
mkdir -p "$INSTALL_DIR/models/Engine 3"
mkdir -p "$INSTALL_DIR/website"

# ── Expected files ────────────────────────────────────────────
echo ""
echo "Place the following files in these locations:"
echo ""
echo "Engine 1 — model weights:"
echo "  $INSTALL_DIR/models/Engine 1/models/engine1_homograph_v13_5.pth"
echo "  $INSTALL_DIR/models/Engine 1/models/tokenizer.json"
echo "  $INSTALL_DIR/models/Engine 1/models/calibrator.pkl"
echo "  $INSTALL_DIR/models/Engine 1/models/feature_stats.npz"
echo "  $INSTALL_DIR/models/Engine 1/models/model_config.json"
echo ""
echo "Engine 1 — data files:"
echo "  $INSTALL_DIR/models/Engine 1/data/brand_db.json"
echo "  $INSTALL_DIR/models/Engine 1/data/english_dict.txt"
echo "  $INSTALL_DIR/models/Engine 1/data/tranco_safe_list.csv"
echo ""
echo "Engine 2:"
echo "  $INSTALL_DIR/models/Engine 2/Engine3_ML_Model.pkl"
echo "  $INSTALL_DIR/models/Engine 2/tranco_domains.txt"
echo ""
echo "Engine 3:"
echo "  $INSTALL_DIR/models/Engine 3/EfficientNet_B0_Phishing.pth"
echo ""
echo "Frontend (copy of frontend/ directory contents):"
echo "  $INSTALL_DIR/website/"
echo ""

# ── Copy from SOURCE_DIR if provided ─────────────────────────
# Uncomment and update SOURCE_DIR above to automate the copy step.
#
# if [ -d "$SOURCE_DIR" ]; then
#   cp "$SOURCE_DIR/models/engine1_homograph_v13_5.pth" \
#      "$INSTALL_DIR/models/Engine 1/models/"
#   cp "$SOURCE_DIR/models/tokenizer.json" \
#      "$INSTALL_DIR/models/Engine 1/models/"
#   cp "$SOURCE_DIR/models/calibrator.pkl" \
#      "$INSTALL_DIR/models/Engine 1/models/"
#   cp "$SOURCE_DIR/models/feature_stats.npz" \
#      "$INSTALL_DIR/models/Engine 1/models/"
#   cp "$SOURCE_DIR/models/model_config.json" \
#      "$INSTALL_DIR/models/Engine 1/models/"
#   cp "$SOURCE_DIR/data/brand_db.json" \
#      "$INSTALL_DIR/models/Engine 1/data/"
#   cp "$SOURCE_DIR/data/english_dict.txt" \
#      "$INSTALL_DIR/models/Engine 1/data/"
#   cp "$SOURCE_DIR/data/tranco_safe_list.csv" \
#      "$INSTALL_DIR/models/Engine 1/data/"
#   echo "Files copied from $SOURCE_DIR"
# else
#   echo "SOURCE_DIR not set or not found. Place files manually."
# fi

echo "Done. Verify all files are in place before starting the server."
