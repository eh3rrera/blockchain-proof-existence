$(document).ready(function() {
	if ( ! (window.File && window.FileReader && window.crypto && window.crypto.subtle && window.crypto.subtle.digest) ) {
		alert('No File API support. Please use the latest vesion of Firefox or Chrome.');
	}

    // block when ajax activity starts 
    $(document).ajaxStart($.blockUI);
    // unblock when ajax activity stops 
    $(document).ajaxStop($.unblockUI); 

	var createProof = true;
	var createLink = $('#create-link');
	var verifiyLink = $('#verify-link');
	var submitLink = $('#submit-link');
	var readAnotherLink = $('#read-another-link');
	var dragZone = $('#drag-zone');
	var inputFile = $('#file');
	var calculatedHash;
	
	createLink.on('click', function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		
		createProof = true;
		createLink.addClass('is-selected');
		verifiyLink.removeClass('is-selected');
	});
	
	verifiyLink.on('click', function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		
		createProof = false;
		verifiyLink.addClass('is-selected');
		createLink.removeClass('is-selected');
	});
	
	submitLink.on('click', function(evt) {
		evt.preventDefault();
		evt.stopPropagation();

        var url = '/verify/' + calculatedHash;
		
		if(createProof) {
            $.ajax({
                type: 'POST',
                url: '/hash',
                data: {
                    hash: calculatedHash
                },
                success: function(data) {console.log(data);
                    var redirect = true;
                    if(data.status === 'Exists') {
                        redirect = confirm('The file is already verified. Do you want to go to the verification page?');
                    }
                    if(redirect) {
                        window.location.href = url;
                    }
                }
            });
        } else {
            window.location.href = url;
        }
	});
	
	readAnotherLink.on('click', function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		
		dragZone.removeClass( 'is-uploading' );
		dragZone.removeClass( 'is-error' );
		dragZone.removeClass( 'is-success' );
	});

	dragZone.on( 'drag dragstart dragend dragover dragenter dragleave drop', function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
	})
	.on( 'dragover dragenter', function(evt)
	{
		dragZone.addClass( 'is-dragover' );
		evt.originalEvent.dataTransfer.dropEffect = 'copy';
	})
	.on( 'dragleave dragend drop', function()
	{
		dragZone.removeClass( 'is-dragover' );
	})
	.on( 'drop', function(evt)
	{
		var files = evt.originalEvent.dataTransfer.files;

		handleFile(files);
	});
	inputFile.on('change', function(evt) {
		var files = evt.originalEvent.target.files;

		handleFile(files);
	});
	
	function handleFile(files) {
		if (!files.length) {
			return;
		}
		var file = files[0];
		
		var reader = new FileReader();
		reader.readAsArrayBuffer(file);
		
		reader.onload = function(e) {
			var data = e.target.result;
			
			window.crypto.subtle.digest({name: 'SHA-256'}, data).then(function(hash) {
				var hexString = '';
				var bytes = new Uint8Array(hash);

				for (var i = 0; i < bytes.length; i++) {
					var hex_i = bytes[i].toString(16);
					hexString += hex_i.length === 1 ? '0' + hex_i : hex_i;
				}

				$('#hash').text(hexString);
                calculatedHash = hexString;
				
				dragZone.removeClass( 'is-uploading' );
				dragZone.removeClass( 'is-error' );
				dragZone.addClass( 'is-success' );
			}).catch(function(e) {
				showError(e);
			});
		};
		
		reader.onloadstart = function(e) {
			dragZone.removeClass( 'is-success' );
			dragZone.removeClass( 'is-error' );
			dragZone.addClass( 'is-uploading' );
		};
		
		reader.onerror = function(e) {
			showError(e);
		};
		
		function showError(e) {
			dragZone.removeClass( 'is-success' );
			dragZone.removeClass( 'is-uploading' );
			dragZone.addClass( 'is-error' );
			console.log(e);
		}
	}
});