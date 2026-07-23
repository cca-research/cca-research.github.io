server:
	hugo server --disableFastRender

IP_ADDR := $(shell ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $$1}')

server:
	hugo server --disableFastRender

remote:
	hugo server --bind 0.0.0.0 --baseURL http://$(IP_ADDR)/

validate:
	python3 scripts/validate.py 	--data-dir data/papers

build:
	hugo


