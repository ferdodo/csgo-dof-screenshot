

dist: www
	rm -rf ../dist
	cd ../www; npx electron-builder
	cd ../www; mv dist ..


www: node_modules
	rm -rf ../www
	npx webpack --mode=development
	cp -r node_modules ../www
	cp static/* ../www
	cp package.json ../www


node_modules: package.json npm-shrinkwrap.json
	npm install