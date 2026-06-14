import sys
import os

# Resolve paths relative to this file so they work regardless of CWD
_here = os.path.dirname(os.path.abspath(__file__))
_repo_root = os.path.dirname(_here)
_backend_dir = os.path.join(_repo_root, "Backend")

# Insert Backend/ first so 'from app.xxx import ...' resolves correctly
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

# Import the FastAPI 'app' object.
# Because Backend/ is on sys.path, main.py's own imports
# ("from app.api.routes import router") all resolve without a package prefix.
from main import app  # noqa: F401
