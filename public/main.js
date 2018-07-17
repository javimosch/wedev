new Vue({
	el: "#app",
	data: function() {
		return {
			node: null
		}
	},
	methods: {
		requestFile,
		initializeAceEditor,
		save
	},
	mounted
});

function save() {
	httpPost('/save-file', {
		path: this.node.data.path,
		code: this.editor.getValue()
	}).then(console.info).catch(console.error)
}

function requestFile(node) {
	this.node = node
	console.log('requestFile', node.data.path)
	httpPost('/request-file', {
		path: node.data.path
	}).then((res) => {
		console.info(res)
		this.editor.setValue(res, -1);

	}).catch(console.error)
}

function mounted() {
	const self = this
	const el = '#tree'
	tree.opened = true
	var treeList = treeToList(tree)

	$(el).on("changed.jstree", function(e, data) {
		console.log(data.node);
		self.requestFile(data.node)
	});
	$(el).jstree({
		'core': {
			'data': [
				mapDirectoryTreeToJsTreeNode(tree)
			]
		}
	});
	self.initializeAceEditor()

}

function initializeAceEditor() {
	var self = this
	this.editor = window.editor = ace.edit("editor");
	editor.setTheme("ace/theme/monokai");
	editor.session.setMode('ace/mode/javascript');
	editor.session.setOptions({
		wrap: true,
		tabSize: 4,
		useSoftTabs: false
	});
	editor.setOptions({
		enableLiveAutocompletion: true,
		fontSize: "10pt",
		showPrintMargin: false
	});
	editor.commands.addCommand({
		name: 'save',
		bindKey: {
			win: 'Alt-Shift-S',
			mac: 'Command-Shift-S'
		},
		exec: function(editor) {
			self.save()
		},
		readOnly: false
	});
}

function treeToList(tree, list) {
	if (!list) list = []
	var getId = () => '_' + Math.random().toString(36).substr(2, 9);
	if (tree instanceof Array) {
		tree.forEach(item => {
			item.id = getId()
			list.push(item)
		})
	} else {
		tree.id = getId()
		list.push(tree)
		if (tree.children) {
			treeToList(tree.children, list)
		}
	}
	return list
}

function mapDirectoryTreeToJsTreeNode(item, index, opened) {
	return {
		id: item.id,
		text: item.name,
		data: {
			path: item.path,
		},
		icon: item.type === 'file' ? "far fa-file-word" : undefined,
		state: {
			opened: item.opened ? item.opened : false,
			selected: false
		},
		children: (item.children || []).map(mapDirectoryTreeToJsTreeNode)
	}
}


function httpPost(url, data) {
	return new Promise((resolve, reject) => {
		if (!data) {
			data = {};
		}
		try {
			$.ajax({
				type: 'post',
				url: url,
				crossDomain: true,
				data: JSON.stringify(data),
				contentType: 'application/json; charset=utf-8',
				xhrFields: {
					withCredentials: true
				}
			}).always(function(response, status, xhr) {
				if (status == 'error') {
					reject({
						message: "error",
						detail: xhr
					});
				}
				if (response.err) {
					reject(response.err);
				} else {
					resolve(response.result || response)
				}
			});
		} catch (err) {
			reject(err)
		}
	});
}

function beautifyAceEditor(editor) {
	var content = editor.session.getValue();
	editor.setValue(js_beautify(content, {
		indent_char: "\t",
		indent_size: 1
	}));
}