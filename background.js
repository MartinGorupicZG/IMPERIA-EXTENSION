//init Audio
let countAlarm = 0;
const audio = new Audio('alarm.mp3');
audio.loop = true;

//SENDER

let sender;
//init conditions for fireing functions
let alarmFromBack = false;
let hireFromBack = false;
let cutFromBack = false;
let saveFromBack = false;

// listen messages from front
chrome.runtime.onMessage.addListener(function (msg, id) {
	sender = id;
	// check if message is type alarm
	if (msg.type === 'Alarm') {
		if (msg.alarm === true) {
			alarmFromBack = true;

			alarm(alarmFromBack);
		} else {
			alarmFromBack = false;

			alarm(alarmFromBack);
		}
	}
	//check if message is type hire
	if (msg.type === 'Hire') {
		if (msg.hire === true) {
			hireFromBack = true;

			hire(hireFromBack);
		} else {
			hireFromBack = false;

			hire(hireFromBack);
		}
	}

	// Check if message from back is type cut
	if (msg.type === 'Cut') {
		if (msg.cut === true) {
			cutFromBack = true;

			cut(cutFromBack);
		} else {
			cutFromBack = false;

			cut(cutFromBack);
		}
	}

	//Check if message is type save
	if (msg.type === 'Save') {
		if (msg.save === true) {
			saveFromBack = true;

			save(saveFromBack);
		} else {
			saveFromBack = false;

			save(saveFromBack);
		}
	}
});
//function for geting random numbers
function random(min, max) {
	var num = Math.floor(Math.random() * (max - min)) + min;
	return num;
}
//check if atack exist
function alarm(onOroff) {
	if (onOroff) {
		const t = random(60 * 1000, 65 * 1000);
		setTimeout(function () {
			if (alarmFromBack) {
				chrome.tabs.query({ windowId: sender.tab.windowId }, function (tabs) {
					chrome.tabs.sendMessage(
						sender.tab.id,
						{ alarmFromBack, type: 'Alarm' },
						function (response) {
							if (response === true && countAlarm < 1) {
								countAlarm++;

								audio.play();
							}
						}
					);
				});
				alarm(true);
			}
		}, t);
	} else {
		countAlarm = 0;
		audio.pause();
		return;
	}
}
//send message to front to hire workers
function hire(onOroff) {
	if (onOroff) {
		const t = random(60 * 2 * 1000, 60 * 3 * 1000);
		setTimeout(function () {
			if (hireFromBack) {
				console.log('if', hireFromBack);
				chrome.tabs.query({ windowId: sender.tab.windowId }, function (tabs) {
					chrome.tabs.sendMessage(sender.tab.id, {
						hireFromBack,
						type: 'Hire',
					});
				});
				hire(true);
			}
		}, t);
	} else {
		return;
	}
}

function cut(onOroff) {
	if (onOroff) {
		const t = random(60 * 61 * 1000, 60 * 63 * 1000);
		setTimeout(function () {
			if (cutFromBack) {
				chrome.tabs.query({ windowId: sender.tab.windowId }, function (tabs) {
					chrome.tabs.sendMessage(sender.tab.id, {
						cutFromBack,
						type: 'Cut',
					});
				});
				cut(true);
			}
		}, t);
	} else {
		return;
	}
}

function save(onOroff) {
	if (onOroff) {
		const t = random(60 * 2.6 * 1000, 60 * 3 * 1000);
		setTimeout(function () {
			if (saveFromBack) {
				chrome.tabs.query({ windowId: sender.tab.windowId }, function (tabs) {
					chrome.tabs.sendMessage(sender.tab.id, {
						saveFromBack,
						type: 'Save',
					});
				});
				save(true);
				console.log('Army sended');
			}
		}, t);
	} else {
		return;
	}
}
