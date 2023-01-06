.PHONY: \
all \
run start \
pretty \
clean

all: run

run: start

start:
	npm start

pretty:
	npx eslint .
	# npx prettier --write .

clean: pretty