IP_ADDR := $(shell ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $$1}')

server:
	hugo server --disableFastRender

remote:
	hugo server --bind 0.0.0.0 --baseURL http://$(IP_ADDR)/

build:
	hugo

# python -m venv .venv
VENV := .venv
PYTHON := $(VENV)/bin/python
PIP := $(VENV)/bin/pip

REQ_FILE := scripts/requirements.txt

$(VENV)/bin/activate: $(REQ_FILE)
	python3 -m venv $(VENV)
	$(PIP) install -r $(REQ_FILE)
	touch $(VENV)/bin/activate

validate: $(VENV)/bin/activate
	python3 scripts/validate.py --data-dir data/papers


