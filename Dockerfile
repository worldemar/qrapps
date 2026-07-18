# Self-contained environment for QR Apps project

FROM debian:12

RUN apt-get -y update && apt-get install -y --no-install-recommends \
    python3-pip=23.0.1+dfsg-1 \
    python3-venv=3.11.2-1+b1 \
    npm=9.2.0~ds1-1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /tmp/requirements.txt
COPY requirements-contrib.txt /tmp/requirements-contrib.txt

RUN python3 -m venv /venv && \
    /venv/bin/python3 -m pip install --upgrade pip && \
    /venv/bin/python3 -m pip install -r /tmp/requirements.txt && \
    /venv/bin/python3 -m pip install -r /tmp/requirements-contrib.txt

RUN npm install -g uglify-js html-minifier inline-scripts

ENV PATH=/venv/bin:$PATH
WORKDIR /src
ENTRYPOINT ["/venv/bin/python3"]