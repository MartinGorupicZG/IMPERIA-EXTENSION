// ==UserScript==
// @name       ColonySearch
// @namespace  Carlinjo
// @version    0.1
// @description Search for colonies
// @match      https://*.imperiaonline.org/imperia/game_v5/game/villagejs.php*
// @copyright  2021, You
// ==/UserScript==

var url =
	'https://www136.imperiaonline.org/imperia/game_v5/game/json/dynamic_map_objects.php?b=20097&b=20098&b=20099&b=20100&b=20101&b=20102&b=20103&b=20104&b=20105';

var mapResponseDecodeKeys = {
	D: 6,
	I: 7,
	Y: 8,
	A: 9,
	N: 10,
};

function decodeMapResponse(response) {
	var k = 0;
	var p = 0;
	var decoded = '';
	var responseLength = response.length;
	while (k < responseLength - 1) {
		p = mapResponseDecodeKeys[response.substr(k, 1)];
		decoded += response.substr(k + 1, p);
		k += p + 1;
	}
	return JSON.parse(atob(decoded));
}

function getData(url) {
	return new Promise(function (resolve, reject) {
		$.ajax({
			url: url,
			success: function (result) {
				try {
					resolve(JSON.parse(result));
				} catch (e) {
					try {
						var decodedResponse = decodeMapResponse(result);
						showData(decodedResponse);
						console.log('ok');
						resolve(decodedResponse);
					} catch (er) {
						resolve({});
					}
				}
			},
			error: function () {
				resolve({});
			},
		});
	});
}

function showData(col) {
	var blocks = col['blocks'];

	for (var blockId = 0; blockId < blocks.length; blockId++) {
		var block = blocks[blockId]['data'];
		for (var i = 0; i < block.length; i++) {
			if (block[i].obs[0].ttp[1] !== undefined) {
				console.log(block[i]);
			}
		}
	}
}
key;
key;
key[0];
