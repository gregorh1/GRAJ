# GRAJ

- project board: https://trello.com/b/h9FYO2eI/graj 
- deployed: https://gregorh1.github.io/GRAJ/

##
- install: `npm i`
- to run project in watch mode: `npm start`
- to build app into docs folder (for deploy on githubPages): `npm run build`
- to build an android app 
  - first add an android platform to project (with capacitor cli) 
by running `npx cap add android` 
  - then you can do builds by running `npm run buildApp` - it opens Android Studio, where you can build an app. 
(TODO - use gradle cli in future). 
You need to have Android SDK properly set on your computer. Check capacitor docs. 
It builds `.apk` file here: android/app/build/outputs/apk/debug/app-debug.apk