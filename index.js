require('dotenv').config({silent:true})
var express = require('express')
var app = express()
var path = require('path')
const pug = require('pug');
const fs = require('fs');

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
	next();
});


app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	res.renderPug = (filePath, vars) => {
		var tpl = pug.compileFile(
			path.join(__dirname, '/views/' + filePath.replace('.pug', '') + '.pug')
		);
		res.send(tpl(vars))
	};
	next()
});

app.get('/', (req, res) => {
	res.renderPug('root')
	//res.send('A')
})

app.listen(process.env.PORT, function() {
	console.log('Listening on ' + process.env.PORT)
})