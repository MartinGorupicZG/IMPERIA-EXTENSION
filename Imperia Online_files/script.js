// Replaces the currently selected text with the passed text.
function replaceText(text, textarea)
{
	// Attempt to create a text range (IE).
	if (typeof(textarea.caretPos) != "undefined" && textarea.createTextRange)
	{
		var caretPos = textarea.caretPos;

		caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text + ' ' : text;
		caretPos.select();
	}
	// Mozilla text range replace.
	else if (typeof(textarea.selectionStart) != "undefined")
	{
		var begin = textarea.value.substr(0, textarea.selectionStart);
		var end = textarea.value.substr(textarea.selectionEnd);
		var scrollPos = textarea.scrollTop;

		textarea.value = begin + text + end;

		if (textarea.setSelectionRange)
		{
			textarea.focus();
			textarea.setSelectionRange(begin.length + text.length, begin.length + text.length);
		}
		textarea.scrollTop = scrollPos;
	}
	// Just put it on the end.
	else
	{
		textarea.value += text;
		textarea.focus(textarea.value.length - 1);
	}
}

// Surrounds the selected text with text1 and text2.
function surroundText(text1, text2, textarea)
{
	// Can a text range be created?
	if (typeof(textarea.caretPos) != "undefined" && textarea.createTextRange)
	{
		var caretPos = textarea.caretPos, temp_length = caretPos.text.length;

		caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text1 + caretPos.text + text2 + ' ' : text1 + caretPos.text + text2;

		if (temp_length == 0)
		{
			caretPos.moveStart("character", -text2.length);
			caretPos.moveEnd("character", -text2.length);
			caretPos.select();
		}
		else
			textarea.focus(caretPos);
	}
	// Mozilla text range wrap.
	else if (typeof(textarea.selectionStart) != "undefined")
	{
		var begin = textarea.value.substr(0, textarea.selectionStart);
		var selection = textarea.value.substr(textarea.selectionStart, textarea.selectionEnd - textarea.selectionStart);
		var end = textarea.value.substr(textarea.selectionEnd);
		var newCursorPos = textarea.selectionStart;
		var scrollPos = textarea.scrollTop;

		textarea.value = begin + text1 + selection + text2 + end;

		if (textarea.setSelectionRange)
		{
			if (selection.length == 0)
				textarea.setSelectionRange(newCursorPos + text1.length, newCursorPos + text1.length);
			else
				textarea.setSelectionRange(newCursorPos, newCursorPos + text1.length + selection.length + text2.length);
			textarea.focus();
		}
		textarea.scrollTop = scrollPos;
	}
	// Just put them on the end, then.
	else
	{

		textarea.focus();
		sel = document.selection.createRange();
		sel.text = text1+sel.text+text2;

		/*var begin = textarea.value.substr(0, textarea.selectionStart);
		var doc = document.selection;
		alert(var doc = document.selection;);
		textarea.value = text1 + document.selection.createRange().text + text2; */
		//textarea.focus(textarea.value.length - 1);
	}
}

function surroundTextLimit(text1, text2, textarea,$limit,$error,$toField)
{
	// Can a text range be created?

	if (typeof(textarea.caretPos) != "undefined" && textarea.createTextRange)
	{

		var caretPos = textarea.caretPos, temp_length = caretPos.text.length;
		if ( (text1.length + text2.length + caretPos.text.length) > $limit ){
			/*setTimeout(function(){
					$('#countLimitError').remove();
				}
			,2000);*/
			
			return $($toField).html('<div class="notice type-negative" id="countLimitError">' + $error + '</div>');
		}
		if (/color/.test(caretPos.text)) {
			var color = text1.match(/\[color=(.*?)\]/);
			if (color[1] != '') {
				var currentColor = selection.match(/\[color=(.*?)\]/);
				caretPos.text = caretPos.text.replace('=' + currentColor[1],'=' + color[1]);
				caretPos.text = begin + caretPos.text + end;
			}
		} else {
			caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text1 + caretPos.text + text2 + ' ' : text1 + caretPos.text + text2;
		}
		
		if (temp_length == 0)
		{
			caretPos.moveStart("character", -text2.length);
			caretPos.moveEnd("character", -text2.length);
			caretPos.select();
		}
		else 
			textarea.focus(caretPos);
	}
	// Mozilla text range wrap.
	else if (typeof(textarea.selectionStart) != "undefined")
	{
		var begin = textarea.value.substr(0, textarea.selectionStart);
		var selection = textarea.value.substr(textarea.selectionStart, textarea.selectionEnd - textarea.selectionStart);
		var end = textarea.value.substr(textarea.selectionEnd);
		var newCursorPos = textarea.selectionStart;
		var scrollPos = textarea.scrollTop;
		
		if ( (text1.length + text2.length + textarea.value.length) > $limit ){
			/*setTimeout(function(){
					$('#countLimitError').remove();
				}
			,2000);*/
			
			return $($toField).html('<div class="notice type-negative" id="countLimitError">' + $error + '</div>');
		}
		
		if (/color/.test(selection)) {
			var color = text1.match(/\[color=(.*?)\]/);
			if (color[1] != '') {
				var currentColor = selection.match(/\[color=(.*?)\]/);
				selection = selection.replace('=' + currentColor[1],'=' + color[1]);
				textarea.value = begin + selection + end;
			}
		} else {
			textarea.value = begin + text1 + selection + text2 + end;
		}

		if (textarea.setSelectionRange)
		{
			if (selection.length == 0)
				textarea.setSelectionRange(newCursorPos + text1.length, newCursorPos + text1.length);
			else
				textarea.setSelectionRange(newCursorPos, newCursorPos + text1.length + selection.length + text2.length);
			textarea.focus();
		}
		textarea.scrollTop = scrollPos;
	}
	// Just put them on the end, then.
	else
	{

		textarea.focus();
		sel = document.selection.createRange();
		if ( (text1.length + text2.length + sel.text.length) > $limit ){
			/*setTimeout(function(){
					$('#countLimitError').remove();
				}
			,2000);*/
			
			return $($toField).html('<div class="notice type-negative" id="countLimitError">' + $error + '</div>');
		}
		
		if (/color/.test(sel.text)) {
			
			var color = text1.match(/color=([a-z]+)/);
			
			if (color[0] != '') {
				var currentColor = sel.text.match(/color=([a-z]+)/);
				sel.text = sel.text.replace(currentColor[0],color[0]);
			}
		} else {
			sel.text = text1+sel.text+text2;
		}

		/*var begin = textarea.value.substr(0, textarea.selectionStart);
		var doc = document.selection;
		alert(var doc = document.selection;);
		textarea.value = text1 + document.selection.createRange().text + text2; */
		//textarea.focus(textarea.value.length - 1);
	}
}

// Checks if the passed input's value is nothing.
function isEmptyText(theField)
{
	// Copy the value so changes can be made..
	var theValue = theField.value;

	// Strip whitespace off the left side.
	while (theValue.length > 0 && (theValue.charAt(0) == ' ' || theValue.charAt(0) == '\t'))
		theValue = theValue.substring(1, theValue.length);
	// Strip whitespace off the right side.
	while (theValue.length > 0 && (theValue.charAt(theValue.length - 1) == ' ' || theValue.charAt(theValue.length - 1) == '\t'))
		theValue = theValue.substring(0, theValue.length - 1);

	if (theValue == '')
		return true;
	else
		return false;
}