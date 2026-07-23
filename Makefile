server:
	hugo server --disableFastRender

validate:
	python3 scripts/validate.py 	--data-dir data/papers

build:
	hugo


