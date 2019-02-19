module.exports = {
  "roots": [
    "<rootDir>",
    "<rootDir>/src/", 
    "<rootDir>/src/dom", 
    "<rootDir>/test/"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testRegex": "(/test/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ]
}