# FakeSite Hunter

An AI-powered phishing and homograph detection platform built as a Final Year Project. It analyzes URLs through a three-engine pipeline — URL/domain structure, page content + NLP, and visual screenshot analysis — and returns a verdict of **PHISHING**, **SUSPICIOUS**, or **LEGITIMATE** with a confidence score.

The system is deployed as a Flask backend serving a static HTML/CSS/JS frontend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Python 3.12, Flask, Flask-CORS |
| Engine 1 | PyTorch (CNN + BiGRU + Transformer), custom homograph detection |
| Engine 2 | LightGBM (scikit-learn pipeline), Selenium, NLTK NLP |
| Engine 3 | EfficientNet-B0 (PyTorch), Selenium screenshot capture |
| Browser automation | Selenium + headless Chrome |
| Database | SQLite (scan stats, visitor counter) |
| Deployment | Linux server (CPU inference), Chrome stable |

---

## Project Structure

```
fakesitehunter/
├── frontend/                  # Static website (served by Flask)
│   ├── index.html             # Main page with scan UI
│   ├── style.css
│   ├── script.js              # API calls, result rendering, live stats
│   ├── about.html
│   ├── how-it-works.html
│   ├── contact.html
│   ├── privacy-policy.html
│   ├── terms-of-service.html
│   └── consent-agreement.html
│
├── backend/
│   └── app.py                 # Flask server + all three engine pipelines
│
├── models/                    # ML model files (not committed — see below)
│   ├── Engine 1/
│   │   ├── models/            # .pth weights, tokenizer, calibrator, stats
│   │   └── data/              # brand_db.json, english_dict.txt, tranco CSV
│   ├── Engine 2/
│   │   ├── Engine3_ML_Model.pkl
│   │   └── tranco_domains.txt
│   └── Engine 3/
│       └── EfficientNet_B0_Phishing.pth
│
├── scripts/
│   └── download_models.sh     # Documents where to place model files
│
├── docs/
│   └── model_config.json      # Architecture reference (Engine 1)
│
├── requirements.txt
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── SECURITY.md
```

---

## Setup and Run Locally

### Prerequisites

- Python 3.12
- `google-chrome-stable` installed at `/usr/bin/google-chrome-stable`
- Model files placed at `/opt/fakesitehunter/models/` (see [Model Files](#model-files))

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-username/fakesitehunter.git
cd fakesitehunter

# 2. Create a virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your paths

# 5. Place model files (see Model Files section below)

# 6. Run the server
python backend/app.py
```

The server starts at `http://127.0.0.1:5000`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Default |
|---|---|---|
| `BASE_DIR` | Path to Engine 1 model files | `/opt/fakesitehunter/models/Engine 1/models` |
| `WEBSITE_DIR` | Path to the frontend folder | `/opt/fakesitehunter/website` |
| `STATS_DB_PATH` | Path to SQLite stats database | `/opt/fakesitehunter/stats.db` |

---

## Model Files

Model weights are **not committed to this repository** due to file size. You need to place them manually.

### Required layout

```
/opt/fakesitehunter/
├── models/
│   ├── Engine 1/
│   │   ├── models/
│   │   │   ├── engine1_homograph_v13_5.pth
│   │   │   ├── tokenizer.json
│   │   │   ├── calibrator.pkl
│   │   │   ├── feature_stats.npz
│   │   │   └── model_config.json
│   │   └── data/
│   │       ├── brand_db.json
│   │       ├── english_dict.txt
│   │       └── tranco_safe_list.csv
│   ├── Engine 2/
│   │   ├── Engine3_ML_Model.pkl
│   │   └── tranco_domains.txt
│   └── Engine 3/
│       └── EfficientNet_B0_Phishing.pth
└── website/                   # Copy of the frontend/ folder
```

See `scripts/download_models.sh` for a template to automate placement.

If you are grading or demoing offline, contact the project team for the model archive.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/scan` | Scan a URL. Body: `{ "url": "..." }` |
| `GET` | `/api/stats` | Returns total scans, threats detected, visitor count |
| `GET` | `/api/recent` | Returns last 10 scans |
| `GET` | `/api/health` | Health check + engine version |

---

## How Detection Works

1. **Engine 1** — URL-only analysis (no browser). Detects Unicode homoglyphs, punycode abuse, leet substitutions, brand impersonation, zero-width characters, and BiDi overrides using a CNN+BiGRU+Transformer model (281K parameters, v13.5).

2. **Engine 2** — Loads the page in headless Chrome. Extracts 40+ URL and HTML features, runs a LightGBM classifier, and applies NLP rules for brand spoofing and urgency language.

3. **Engine 3** — Takes a screenshot of the page and classifies it with a fine-tuned EfficientNet-B0 model trained to recognize phishing-style UI layouts.

Engines 2 and 3 are only invoked when Engine 1 does not reach a confident verdict.

---

## Deployment Notes

The live deployment runs on a Linux server with:
- Flask served directly (`host=127.0.0.1`, port 5000), reverse-proxied via Nginx
- CPU-only inference (`DEVICE = cpu`)
- Chrome stable for Selenium headless screenshots
- SQLite at `/opt/fakesitehunter/stats.db` for shared scan statistics
- Frontend files served as Flask static files from `WEBSITE_DIR`

The `API_URL` in `frontend/script.js` is set to `https://fakesitehuter.dev` — update this if you are running locally.

---

## Common Troubleshooting

**`ModuleNotFoundError: efficientnet_pytorch`**
Install with `pip install efficientnet-pytorch==0.7.1`. Note: package name uses a hyphen.

**`selenium.common.exceptions.WebDriverException: chrome not reachable`**
Make sure `google-chrome-stable` is installed and the binary path in `create_driver()` matches your system.

**Engine 2/3 returns `LINK DOES NOT EXIST`**
The URL timed out or Chrome could not load the page. This is expected for dead links.

**Stats endpoint returns zeros**
The SQLite database initializes on first run. Make sure the `STATS_DB_PATH` directory is writable.

**`torch.load` warning about `weights_only`**
Safe to ignore in this codebase — model files are local. The checkpoint uses `weights_only=False` intentionally for compatibility.

---

## Training Notebooks

The training notebooks are in the repo for reference only — do **not** re-run them against the committed model files, as it would invalidate the test-set metrics.

| Notebook | Purpose |
|---|---|
| `L135_Final_FYP_HOMOGRAPH_CODE.ipynb` | Engine 1 full training pipeline (v13.5) |
| `url_html_nlp_code.ipynb` | Engine 2 feature engineering |
| `url_html_nlp_model.ipynb` | Engine 2 model training |
| `best_fyp_model_backend.ipynb` | Engine 3 EfficientNet training |
| `besy_fyp_sc_backend.ipynb` | Engine 3 screenshot collection |

---

## License

See [LICENSE](LICENSE).
