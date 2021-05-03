// Hire workers
xajax_fastHireWorkers = function () {
	return xajax.request(
		{ xjxfun: 'fastHireWorkers' },
		{ parameters: arguments }
	);
};

//Cut 10 min

xajax_listResearches = function () {
	return xajax.request({ xjxfun: 'listResearches' }, { parameters: arguments });
};

//Change province
xajax_provinces_info = function () {
	return xajax.request({ xjxfun: 'provinces_info' }, { parameters: arguments });
};

xajax_change_current_province = function () {
	return xajax.request(
		{ xjxfun: 'change_current_province' },
		{ parameters: arguments }
	);
};

xajax_premiumMoveAll = function () {
	return xajax.request({ xjxfun: 'premiumMoveAll' }, { parameters: arguments });
};

xajax_doFlashStaff = function () {
	return xajax.request({ xjxfun: 'doFlashStaff' }, { parameters: arguments });
};
xajax_listBlueFlag = function () {
	return xajax.request({ xjxfun: 'listBlueFlag' }, { parameters: arguments });
};
