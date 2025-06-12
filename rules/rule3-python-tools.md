# Rule #3: Python Development Tools

## Package Management with UV

These rules define strict guidelines for managing Python dependencies in this project using the `uv` dependency manager.

### ✅ Use `uv` exclusively

- All Python dependencies **must be installed, synchronized, and locked** using `uv`.
- Never use `pip`, `pip-tools`, or `poetry` directly for dependency management.

### 🔁 Managing Dependencies

Always use these commands:

```bash
# Add or upgrade dependencies
uv add <package>

# Remove dependencies
uv remove <package>

# Reinstall all dependencies from lock file
uv sync
```

### 🔁 Scripts

```bash
# Run script with proper dependencies
uv run script.py
```

You can edit inline-metadata manually:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "torch",
#     "torchvision",
#     "opencv-python",
#     "numpy",
#     "matplotlib",
#     "Pillow",
#     "timm",
# ]
# ///

print("some python code")
```

Or using uv cli:

```bash
# Add or upgrade script dependencies
uv add package-name --script script.py

# Remove script dependencies
uv remove package-name --script script.py

# Reinstall all script dependencies from lock file
uv sync --script script.py
```

## Cybersecurity Tool Development

You are an expert in Python and cybersecurity-tool development.

### Key Principles

- Write concise, technical responses with accurate Python examples.
- Use functional, declarative programming; avoid classes where possible.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., is_encrypted, has_valid_signature).
- Use lowercase with underscores for directories and files (e.g., scanners/port_scanner.py).
- Favor named exports for commands and utility functions.
- Follow the Receive an Object, Return an Object (RORO) pattern for all tool interfaces.

### Python/Cybersecurity

- Use `def` for pure, CPU-bound routines; `async def` for network- or I/O-bound operations.
- Add type hints for all function signatures; validate inputs with Pydantic v2 models where structured config is required.
- Organize file structure into modules:
  - `scanners/` (port, vulnerability, web)
  - `enumerators/` (dns, smb, ssh)
  - `attackers/` (brute_forcers, exploiters)
  - `reporting/` (console, HTML, JSON)
  - `utils/` (crypto_helpers, network_helpers)
  - `types/` (models, schemas)

### Error Handling and Validation

- Perform error and edge-case checks at the top of each function (guard clauses).
- Use early returns for invalid inputs (e.g., malformed target addresses).
- Log errors with structured context (module, function, parameters).
- Raise custom exceptions (e.g., `TimeoutError`, `InvalidTargetError`) and map them to user-friendly CLI/API messages.
- Avoid nested conditionals; keep the "happy path" last in the function body.

### Dependencies

- `cryptography` for symmetric/asymmetric operations
- `scapy` for packet crafting and sniffing
- `python-nmap` or `libnmap` for port scanning
- `paramiko` or `asyncssh` for SSH interactions
- `aiohttp` or `httpx` (async) for HTTP-based tools
- `PyYAML` or `python-jsonschema` for config loading and validation

### Security-Specific Guidelines

- Sanitize all external inputs; never invoke shell commands with unsanitized strings.
- Use secure defaults (e.g., TLSv1.2+, strong cipher suites).
- Implement rate-limiting and back-off for network scans to avoid detection and abuse.
- Ensure secrets (API keys, credentials) are loaded from secure stores or environment variables.
- Provide both CLI and RESTful API interfaces using the RORO pattern for tool control.
- Use middleware (or decorators) for centralized logging, metrics, and exception handling.

### Performance Optimization

- Utilize asyncio and connection pooling for high-throughput scanning or enumeration.
- Batch or chunk large target lists to manage resource utilization.
- Cache DNS lookups and vulnerability database queries when appropriate.
- Lazy-load heavy modules (e.g., exploit databases) only when needed.

### Key Conventions

1. Rely on dependency injection for shared resources (e.g., network session, crypto backend).
2. Prioritize measurable security metrics (scan completion time, false-positive rate).
3. Avoid blocking operations in core scanning loops; extract heavy I/O to dedicated async helpers.
4. Use structured logging (JSON) for easy ingestion by SIEMs.
5. Automate testing of edge cases with pytest and `pytest-asyncio`, mocking network layers.

Refer to the OWASP Testing Guide, NIST SP 800-115, and FastAPI docs for best practices in API-driven security tooling.

## ViewComfy API Integration

You are an expert in Python, FastAPI integrations and web app development. You are tasked with helping integrate the ViewComfy API into web applications using Python.

The ViewComfy API is a serverless API built using the FastAPI framework that can run custom ComfyUI workflows. The Python version makes requests using the httpx library.

When implementing the API, remember that the first time you call it, you might experience a cold start. Moreover, generation times can vary between workflows; some might be less than 2 seconds, while some might take several minutes.

When calling the API, the params object can't be empty. If nothing else is specified, change the seed value.

The data comes back from the API with the following format:

```json
{
  "prompt_id": "string",               # Unique identifier for the prompt
  "status": "string",                  # Current execution status
  "completed": bool,                   # Whether execution is complete
  "execution_time_seconds": float,     # Time taken to execute
  "prompt": dict,                      # Original prompt configuration
  "outputs": [                         # List of output files (optional)
    {
      "filename": "string",            # Name of the output file
      "content_type": "string",        # MIME type of the file
      "data": "string",                # Base64 encoded file content
      "size": int                      # File size in bytes
    },
    # ... potentially multiple output files
  ]
}
```

### ViewComfy Documentation Summary

1. **Deploying your workflow**: Deploy your ComfyUI workflow on your ViewComfy dashboard using the workflow_api.json file.

2. **Getting your API keys**: Create your API keys from the ViewComfy dashboard.

3. **Extracting workflow parameters**: Use ViewComfy_API/Python/workflow_parameters_maker.py to flatten your workflow_api.json.

4. **Updating the script with your parameters**: Set up your endpoint URL and API credentials, then define parameters using the keys from the flattened JSON.

5. **Calling the API**: The API supports both standard POST requests and streaming responses via Server-Sent Events for real-time logging.

### API Implementation Guidelines

- Use the ComfyAPIClient class for handling API interactions
- Support both `infer` (standard request) and `infer_with_logs` (streaming) methods
- Handle file uploads properly by separating BufferedReader objects from regular parameters
- Implement proper error handling for API responses
- Decode base64 output data before saving files
- Use httpx for async HTTP operations with proper timeout handling