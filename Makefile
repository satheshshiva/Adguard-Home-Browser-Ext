build: 
	make clean
	make install
	npm run build

install:
	npm install

firefox:
	rm -rf dist/firefox
	npm run start-firefox

chrome:
	rm -rf dist/chrome
	npm run start-chrome

outdated:
	npm outdated

clean:
	rm -rf node_modules dist
