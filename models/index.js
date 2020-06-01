const manifest = [
];
manifest.forEach(function (model) {
	module.exports[model] = require('./' + model);
});