var _upldr = function(){
	
	this.options = {
		'target' : "gallery/fileUpload.php",
		'typeMatch' : 'image.*',
		'cbReaderOnload' : function(){
			console.log("cbReaderOnload");
		},
		'cbReset' : function(){
			document.getElementById('file-table-body').innerHTML = "";
		}	
	};
	var options = this.options;
	console.log(options.typeMatch);
	
	this.set = function(data){
		if(data){
			for (var key in data) {
	  			options[key] = data[key];
			}
		}		
	}
	
	var files = [];
	var request;
	var form = document.getElementById('upldr-form');
	var inputFile = document.getElementById('upldr-input-file');
	var progressBar = document.getElementById('upldr-progress-bar');
	var submitBtn = document.getElementById('upldr-submit-btn');
	var resetBtn = document.getElementById('upldr-reset-btn');
	var abortBtn = document.getElementById('upldr-abort-btn');
	submitBtn.disabled = true;
	resetBtn.disabled = true;
	abortBtn.disabled = true;
	
	var submitBtnInitText = submitBtn.innerHTML;
	
	var dropZone = document.querySelectorAll('.upldr-dropzone');
	if(dropZone.length < 1){
		dropZone = document.body;
	}


	function fileSelect(evt) {

		evt.stopPropagation();
		evt.preventDefault();

		var evtFiles;
		if (evt.target.files) {
			evtFiles = evt.target.files;
		} else if (evt.dataTransfer.files) {
			evtFiles = evt.dataTransfer.files;
		} else {
			return false;
		}

		for (var i = 0; i < evtFiles.length; i++) {
			// Only process image files:
			if (evtFiles[i].type.match(options.typeMatch)) {
				files.push(evtFiles[i]);
			}
		}

		if (files.length < 1) {
			return false;
		}
		submitBtn.disabled = false;
		resetBtn.disabled = false;

		var ftb = document.getElementById('file-table-body');
		ftb.innerHTML = "";

		for (var i = 0; i < files.length; i++) {
			var reader = new FileReader();
			
			var f = files[i];
			reader.name = f.name;
			if(getSlug){
				var str = f.name.split('.');
				str[0] = getSlug(str[0]);
				reader.name = str.join('.');
			}
			reader.type = f.type;
			// file size from bytes to KB:
			reader.size = (f.size / 1000).toFixed(2);
			//var fLastMod = f.lastModified;
			reader.lastMod = f.lastModifiedDate.toLocaleDateString();
			
			reader.onload = function(e) {
				var src = e.target.result;
				options.cbReaderOnload(src, this.name, this.type, this.size, this.lastMod);
			};
			reader.readAsDataURL(f);
		}

	};

	function fileDragOver(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy';
	};

	function abort() {
		if (request) {
			request.abort();
		}
	};
	
	this.reset = function() {
		console.log("reset");
		files = [];
		form.reset();
		progressBar.style.width = 0;
		progressBar.innerHTML = "";
		submitBtn.innerHTML = submitBtnInitText;
		submitBtn.disabled = true;
		resetBtn.disabled = true;
		if(options.cbReset){
			options.cbReset();
		}
		//document.getElementById('file-table-body').innerHTML = "";
	};

	function progress(e) {
		if (e.lengthComputable) {
			percLoaded = Math.round(e.loaded / e.total * 100) + "%";
			progressBar.style.width = percLoaded;
			progressBar.innerHTML = percLoaded;
			submitBtn.textContent = percLoaded;
		}
	};

	function upload(e) {
		e.preventDefault();

		submitBtn.disabled = true;
		resetBtn.disabled = true;

		if (!files || files.length === 0) {
			console.log('no files to upload');
			return false;
		}

		var formdata = new FormData();
		for (var i = 0; i < files.length; i++) {
			var f = files[i];
			if (f.type.match(options.typeMatch)) {
				formdata.append('files[]', f);
			}
		}
		
		if(options.data){
			formdata.append('data', options.data);
		}

		request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			//if (request.readyState == 4) {
			try {
				var resp = JSON.parse(request.response);
			} catch (e) {
				/*
				var resp = {
					status : 'error',
					data : 'Unknown error occurred: [' + request.responseText + ']'
				};
				*/
			}
			//console.log(resp.status + ': ' + resp.data);
			//}
		};

		request.onloadend = function(e) {
			//console.log(e.target.response);
			if(options.cbOnloadend){
				options.cbOnloadend(e);	
			}
		};

		request.upload.addEventListener("progress", progress, false);
		request.open("POST", options.target, true);
		request.send(formdata);
	};

	
	form.onsubmit = upload;
	abortBtn.onclick = abort
	resetBtn.onclick = this.reset;
	inputFile.onchange = fileSelect;
	//inputFile.addEventListener('change', fileSelect, false);

	dropZone.addEventListener('dragover', fileDragOver, false);
	dropZone.addEventListener('drop', fileSelect, false);

};

var upldr = new _upldr;
