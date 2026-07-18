# Docker Compose Commands

This project uses Docker Compose to simplify all development and build commands.

## Prerequisites

- Docker Desktop installed
- Docker Compose (v2+) installed

## Build the Environment

```bash
docker-compose build
```

## Interactive Shell for Debugging

```bash
docker-compose run --rm shell
```

Opens an interactive bash shell with all dependencies installed and your local code mounted.

## Code Quality Check

```bash
docker-compose run --rm lint
```

Runs ruff linting on Python code.

## Convert Everything to QR Codes

```bash
docker-compose run --rm qrs
```

Converts all apps in `apps/` directory to QR codes in `bundles/`.

## Convert Single App to QR Code

```bash
docker-compose run --rm qr --htmldir=apps/demo-clock --builddir=bundles
```

Replace `demo-clock` with any app directory name under `apps/`.

## Release Bundles

```bash
docker-compose run --rm release
```

Generates `docs/README.md` with links and QR codes for all apps.

## Additional Utility Commands

### Minification Tools

```bash
# Uglify JS files
docker-compose run --rm uglifyjs [options] <input.js>

# Minify HTML
docker-compose run --rm html-minifier [options] <input.html>

# Inline script tags
docker-compose run --rm inline-script-tags <input.html> <output.html>

# Inline stylesheets
docker-compose run --rm inline-stylesheets <input.html> <output.html>
```
