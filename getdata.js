console.log('Inicia SCAN');

var ix = prompt('Area Inicial: ');
var iy = prompt('Area Final: ');

if (ix == '') {
	ix = 0;
}

if (iy == '') {
	iy = 0;
}

ix = parseInt(ix);
iy = parseInt(iy);

var server = prompt('Server: ');
var rootURL =
	'https://www' +
	server +
	'.imperiaonline.org/imperia/game_v6/game/json/globalMapJson.php?';

var resultContainer =
	'<div id="resultContainer" style="width:280px;;background: #FFFFFF; position: absolute; top:0;left:400px;z-index:99999"></div>';
$('body').append(resultContainer);

var ixa = 0;
var ixb = 0;
var ixc = 0;
var ixd = 0;
var ixe = 0;
var ixf = 0;
var ixg = 0;
var ixh = 0;
var ixi = 0;

for (ix; ix <= iy; ix++) {
	ixa = ix + 1;
	ixb = ix + 2;
	ixc = ix + 3;
	ixd = ix + 4;
	ixe = ix + 5;
	ixf = ix + 6;
	ixg = ix + 7;
	ixh = ix + 8;
	ixi = ix + 9;

	console.log(
		rootURL +
			'&b=' +
			ix +
			'&b=' +
			ixa +
			'&b=' +
			ixb +
			'&b=' +
			ixc +
			'&b=' +
			ixd +
			'&b=' +
			ixe +
			'&b=' +
			ixf +
			'&b=' +
			ixg +
			'&b=' +
			ixh +
			'&b=' +
			ixi +
			'&decrypt=1'
	);

	$.ajax({
		url:
			rootURL +
			'&b=' +
			ix +
			'&b=' +
			ixa +
			'&b=' +
			ixb +
			'&b=' +
			ixc +
			'&b=' +
			ixd +
			'&b=' +
			ixe +
			'&b=' +
			ixf +
			'&b=' +
			ixg +
			'&b=' +
			ixh +
			'&b=' +
			ixi +
			'&decrypt=1',
		type: 'POST',
		contentType: 'application/json',
		dataType: 'json',
		data: JSON.stringify(location),
		success: function (data) {
			console.log(
				'Return:' +
					rootURL +
					'&b=' +
					ix +
					'&b=' +
					ixa +
					'&b=' +
					ixb +
					'&b=' +
					ixc +
					'&b=' +
					ixd +
					'&b=' +
					ixe +
					'&b=' +
					ixf +
					'&b=' +
					ixg +
					'&b=' +
					ixh +
					'&b=' +
					ixi +
					'&decrypt=1'
			);
			var blocks = data['blocks'];

			for (var blockId = 0; blockId < blocks.length; blockId++) {
				var block = blocks[blockId]['data'];

				for (var i = 0; i < block.length; i++) {
					var vtooltip = block[i]['tooltip'];

					var pm = 'Bônus';

					if (vtooltip['d'][1]['t'] == pm) {
						console.log('Buscando recursos....');
						var infos = vtooltip['d'];
						var x = Number(block[i]['x']);
						var y = Number(block[i]['y']);
						var iname = vtooltip['t'];

						if (
							iname != 'Fertil' &&
							iname != 'Montes' &&
							iname != 'Montanhas' &&
							iname != 'Floresta' &&
							iname != 'Montanhas com florestas' &&
							iname != 'Montes com florestas'
						) {
							var span =
								'<div style="display:block">' +
								iname +
								';' +
								Math.floor(x) +
								';' +
								Math.floor(y) +
								'</div>';
							$('#resultContainer').append(span);
						}
					}
				}
			}
		},
		error: function (err) {},
	});
	ix = ix + 9;
}

/* package whatever; // don't place package name! */
[0].obs[0].ttp[1].key[1].key[1][1].key;

Math.ceil();

document.createElement('div');
div.style.width = '280';
div.innerHTML;
