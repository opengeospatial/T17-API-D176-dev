# OgcApiDemo

This is a demo application developed for OGC Testbed 17 API Experiments.    
The purpose of this demo is to visualize data from OGC Features and EDR API in NASA WorldWind virtual globe.    
## Submodules
The demo uses OpenAPI auto-generated client libraries which are available in a separate repository:     https://github.com/opengeospatial/T17-API-D176    
NASA WorldWind is forked in this repository:     https://github.com/karriojala/WebWorldWind-OGCTB17    
Any changes related to rendering data from OGC APIs will be developed there.    
In the future these can be uploaded in npm registry, however for now they are included as git submodules.    
The submodules are checked in the project folder under *local_packages* with following command:    
`git submodule update --init `

## Docker

Once you have checked in the submodules, the easiest way to build and run the project is to use the included Dockerfile. Simply run `docker compose up` and you can access the project under `http://localhost:8000/`

## Dependencies
After initializing in the submodules, run the following commands to build them and link them as Node modules:    
In *local_packages/WebWorldWind-OGCTB17* run:    
`npm install && npm run build && npm link`    
In *local_packages/api-daraa* run:    
`npm install && npm run build && cd ./dist && npm link`    
In *local_packages/api-edr* run:    
`npm install && npm run build && cd ./dist && npm link`

Then go back in the *ogc-api-demo* project root and install dependencies:    
`npm install`
And link the git submodules:    
`npm link worldwind-ogctb17`    
`npm link api-daraa`    
`npm link api-edr`

## Run

After dependencies have been installed, run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
