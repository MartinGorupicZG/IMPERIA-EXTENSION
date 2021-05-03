// init UI

const div = document.createElement('div');
div.classList.add('option');
document.body.appendChild(div);

const img = document.createElement('img');
img.src =
	'https://imperiaonline.bg/wp-content/uploads/2017/02/Imperia-Online-logo-bird.png';
img.classList.add('img');
div.appendChild(img);
const wrap = document.createElement('div');
wrap.classList.add('wrap');
div.appendChild(wrap);

const wrapInner = `
<div class="alarm">
<p>Alarm :</p>
<div id="alarm" class="button">
	<div  class="button-slide"></div>
</div>
</div>
<div class="alarm">
<p>Hire :</p>
<div id="hire" class="button">
	<div  class="button-slide"></div>
</div>
</div>
<div class="alarm">
<p>10min :</p>
<div id="10" class="button">
	<div  class="button-slide"></div>
</div>
</div>
<div class="alarm">
<p>Save Army :</p>
<div id="armySave" class="button">
	<div  class="button-slide"></div>
</div>
</div>

`;

wrap.innerHTML += wrapInner;

//add listeners
const alarmBtn = document.getElementById('alarm');
const hireBtn = document.getElementById('hire');
const cutBtn = document.getElementById('10');
const saveBtn = document.getElementById('armySave');
//season Storrage
if (sessionStorage.getItem('alarm')) {
	alarmBtn.classList.add('active');
	document.body.style.background = 'lightgreen';
}
if (sessionStorage.getItem('hire')) {
	hireBtn.classList.add('active');
}

if (sessionStorage.getItem('cut')) {
	cutBtn.classList.add('active');
}
if (sessionStorage.getItem('save')) {
	saveBtn.classList.add('active');
}

// Variables to set state and pass to background

let alarm;
let hire;
let cut;
let save;
// Alarm Button
alarmBtn.addEventListener('click', () => {
	alarmBtn.classList.toggle('active');
	if (alarmBtn.classList.contains('active')) {
		document.body.style.background = 'lightgreen';
		alarm = true;

		sessionStorage.setItem('alarm', 'true');
	} else {
		document.body.style.background = '';
		alarm = false;

		sessionStorage.removeItem('alarm');
	}
	chrome.runtime.sendMessage({ alarm, type: 'Alarm' });
});

//Hire Button

hireBtn.addEventListener('click', () => {
	hireBtn.classList.toggle('active');
	if (hireBtn.classList.contains('active')) {
		hire = true;
		sessionStorage.setItem('hire', 'true');
	} else {
		hire = false;
		sessionStorage.removeItem('hire');
	}

	chrome.runtime.sendMessage({ hire, type: 'Hire' });
});

//Cut Button

cutBtn.addEventListener('click', () => {
	cutBtn.classList.toggle('active');
	if (cutBtn.classList.contains('active')) {
		cut = true;
		sessionStorage.setItem('cut', 'true');
	} else {
		cut = false;
		sessionStorage.removeItem('cut');
	}

	chrome.runtime.sendMessage({ cut, type: 'Cut' });
});

// Save button
saveBtn.addEventListener('click', () => {
	saveBtn.classList.toggle('active');
	if (saveBtn.classList.contains('active')) {
		save = true;
		sessionStorage.setItem('save', 'true');
	} else {
		save = false;
		sessionStorage.removeItem('save');
	}

	chrome.runtime.sendMessage({ save, type: 'Save' });
});

// Message from Background

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.type == 'Alarm') {
		if (document.getElementsByClassName('incoming province')[0] != null) {
			sendResponse(true);
		} else {
			sendResponse(false);
		}
	}

	if (request.type == 'Hire') {
		fireHire();
	}

	if (request.type == 'Cut') {
		fireCut();
	}

	if (request.type == 'Save') {
		fireSave(check);
	}
});

//Functions to fire when message is recived from background

function fireHire() {
	xajax_fastHireWorkers(4, 5, 'AllProv', 3);
}

function fireCut() {
	xajax_listResearches('9', '2', '', -1, 0, 0, 'NULL', 3);
}

function fireSave(callback) {
	xajax_provinces_info('provinces');
	setTimeout(function () {
		callback();
	}, 2000);
}
function check() {
	Array.prototype.random = function () {
		return this[Math.floor(Math.random() * this.length)];
	};
	const provinces = document.querySelectorAll('#fast-provinces a');
	let randomProvince = [];
	for (let i = 0; i < provinces.length; i++) {
		if (provinces[i].classList.contains('current') !== true) {
			randomProvince.push(parseInt(provinces[i].textContent));
		}
	}
	let num = randomProvince.random();

	xajax_change_current_province(666, 1, 'village.php', num);

	xajax_premiumMoveAll(1);
	xajax_premiumMoveAll(3);

	setTimeout(function () {
		xajax_doFlashStaff(284, 0, 1, 0, 2);
		location.reload();
		setTimeout(function () {
			xajax_listBlueFlag(
				containersStuff.findContaner({
					saveName: 'showBlueMissions',
					template: 'untabbed',
					title: 'My missions',
				})
			);
		}, 2000);
	}, 1000);
}
