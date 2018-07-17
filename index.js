require('dotenv').config({
	silent: true
})
var express = require('express')
var app = express()
var path = require('path')
const sander = require('sander')
const pug = require('pug');
const fs = require('fs');
const bodyParser = require('body-parser');
const parseJson = bodyParser.json({
	limit: '50mb'
})

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
})

app.get('/editor', (req, res) => {
	const dirTree = require('directory-tree');
	const tree = dirTree(process.cwd());
	res.renderPug('editor', {
		tree
	})
})

app.post('/request-file', parseJson, async (req, res) => {
	try {
		console.log('req.body.path', req.body.path)
		var isDir = fs.lstatSync(req.body.path).isDirectory()
		res.json({
			result: isDir ? '' : (await sander.readFile(req.body.path)).toString('utf-8'),
		})
	} catch (err) {
		console.error(err.stack)
		res.json({
			result: null,
			err: true
		})
	}
})

app.post('/save-file', parseJson, async (req, res) => {
	try {
		console.log('req.body', req.body)
		var isDir = fs.lstatSync(req.body.path).isDirectory()
		if (!isDir) {
			await sander.writeFile(req.body.path, req.body.code)
		}
		res.json({
			result: true,
		})
	} catch (err) {
		console.error(err.stack)
		res.json({
			result: false,
			err: true
		})
	}
})


app.listen(process.env.PORT, function() {
	console.log('Listening on ' + process.env.PORT)
})