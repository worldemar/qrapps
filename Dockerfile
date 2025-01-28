# Self-contained environment, useful commands:
#
# Build environment image:
# docker build --pull --rm -t qrapps:ci .
#
# After image has been built, you can run:
#
# Interactive shell, useful for debugging:
# docker run --rm -it -v .:/src -w /src --entrypoint=bash qrapps:ci
#
# Code quality check:
# docker run --rm -v .:/src -w /src --entrypoint=prospector qrapps:ci
#
# Convert everything to QR codes:
# docker run --rm -v .:/src -w /src qrapps:ci qrs.py --htmldirs=apps --builddir=bundles
# 
# Convert single app to QR code:
# docker run --rm -v .:/src -w /src qrapps:ci qr.py --htmldir=apps/demo-clock --builddir=bundles

from debian:12

RUN apt-get -y update && apt-get install -y --no-install-recommends \
    python3-pip=23.0.1+dfsg-1 \
    python3-venv=3.11.2-1+b1 \
    npm=9.2.0~ds1-1 \
    && \
    rm -rf /var/lib/apt/lists/*

RUN --mount=type=bind,source=requirements.txt,target=requirements.txt \
    --mount=type=bind,source=requirements-contrib.txt,target=requirements-contrib.txt \
    python3 -m venv /venv && \
    /venv/bin/python3 -m pip install --upgrade pip && \
    /venv/bin/python3 -m pip install -r requirements.txt && \
    /venv/bin/python3 -m pip install -r requirements-contrib.txt

RUN npm install -g uglify-js html-minifier inline-scripts

ENV PATH="/venv/bin:${PATH}"

ENTRYPOINT ["/venv/bin/python3"]