server:
	hugo server --disableFastRender

validate:
	python3 scripts/validate_papers.py 	--data-dir data/papers
	
build:
	hugo


