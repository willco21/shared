var io = io || {};
io.github = io.github || {};
io.github.shunshun94 = io.github.shunshun94 || {};
io.github.shunshun94.trpg = io.github.shunshun94.trpg || {};
io.github.shunshun94.trpg.scenarioTools = io.github.shunshun94.trpg.scenarioTools || {};
io.github.shunshun94.trpg.scenarioTools.ViceCityCheck = class {
	constructor($dom) {
		const id = $dom.attr('id');
		const query = this.getQuery();
		this.components = [
			new io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Calendar($dom.find(`#${id}-calendar`), query),
			new io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.RndEvents($dom.find(`#${id}-rndevents`), query),
			new io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Trump30Table($dom.find(`#${id}-trump30table`), query),
			new io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Missions($dom.find(`#${id}-missions`), query),
			new io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Counters($dom.find(`#${id}-counters`), query)
		];
		$dom.find(`#${id}-generate`).click((e)=>{
			const url = `${location.href.replace(location.search, '')}?${this.components.map((c)=>{return c.generateUrl()}).join('&')}`;
			$dom.find(`#${id}-url`).html(`<a href="${url}">${url}</a>`)
		});
		$dom.find(`#${id}-tabs > button`).click((e)=>{
			$dom.find(`#${id}-tabs > button`).removeClass('active');
			const dom = $(e.target);
			dom.addClass('active');
			this.changeTab(dom.attr('value'));
		});
		this.changeTab(0);
	}

	changeTab(num=-1) {
		this.components.forEach((c)=>{ c.$dom.hide();});
		if(num > -1) {
			this.components[num].$dom.show();
		}
	}

	getQuery(text = '') {
		var params = (text || location.search.slice(1)).split('&');
		var paramLength = params.length;
		var result = {};
		for(var i = 0; i < paramLength; i++) {
			var pair = params[i].split('=');
			result[pair[0]] = pair[1];
		}
		return result;
	}
};

io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Calendar = class {
	constructor($dom, status={}) {
		this.$dom = $dom;
		this.id = $dom.attr('id');
		this.tdClass = `${this.id}-table-day-tr-td`;
		this.currentTime = status.currentTime || 6;
		this.sleptTime = (status.sleptTime || '').split(',');
		this.lunchTime = (status.lunchTime || '').split(',');
		this.generateDom();
		this.drawTable();
		this.bindEvents();
	}
	generateUrl() {
		const currentTimesList = $(`.${this.tdClass}-done`);
		const currentTime = `currentTime=${currentTimesList.length ? this.getTimeId(currentTimesList.last()) : 0}`;

		const sleptTimesList = $.makeArray($(`.${this.tdClass}-slept`));
		console.log(sleptTimesList[2])
		const sleptTime = `sleptTime=${sleptTimesList.map((d)=>{return this.getTimeId($(d))}).join(',')}`;

		const lunchTimesList = $.makeArray($(`.${this.tdClass}-lunch`));
		const lunchTime = `lunchTime=${lunchTimesList.map((d)=>{return this.getTimeId($(d))}).join(',')}`;

		return `${currentTime}&${sleptTime}&${lunchTime}`;
	}

	getTimeId($dom) {
		return Number($dom.attr('id').replace(`${this.tdClass}-`, ''));
	}
	bindEvents() {
		$(`.${this.id}-table-day-tr-td`).click((e)=>{
			const $clicked = $(e.target);
			const timeId = this.getTimeId($clicked);
			for(var i = 0; i < timeId; i++) {
				const $td = $(`#${this.tdClass}-${i}`); 
				$td.addClass(`${this.tdClass}-done`);
				if($td.text() === '未') {
					$(`#${this.tdClass}-${i}`).text('済');
				}
			}
			const currentText = $clicked.text(); 
			if(currentText === '未') {
				$clicked.text('済');
				$clicked.addClass(`${this.tdClass}-done`);
			} else if(currentText === '済') {
				$clicked.text('寝');
				$clicked.addClass(`${this.tdClass}-slept`);
			} else if(currentText === '寝') {
				$clicked.text('食');
				$clicked.addClass(`${this.tdClass}-lunch`);
				$clicked.removeClass(`${this.tdClass}-slept`);
			} else {
				$clicked.text('未');
				$clicked.removeClass(`${this.tdClass}-done`);
				$clicked.removeClass(`${this.tdClass}-lunch`);
			}
			
		});
	}
	
	drawTable() {
		for(var i = 0; i < this.currentTime; i++) {
			$(`#${this.tdClass}-${i}`).addClass(`${this.tdClass}-done`);
			$(`#${this.tdClass}-${i}`).text('済');
		}
		this.sleptTime.forEach((day, i)=>{
			$(`#${this.tdClass}-${day}`).addClass(`${this.tdClass}-slept`);
			$(`#${this.tdClass}-${day}`).text('寝');
		});
		this.lunchTime.forEach((day, i)=>{
			$(`#${this.tdClass}-${day}`).addClass(`${this.tdClass}-lunch`);
			$(`#${this.tdClass}-${day}`).text('食');
		});
		
	}
	generateDom() {
		let dayCount = 0;
		let $table = $(
				`<table id="${this.id}-table" border="1">
					<thead>
						<caption>カレンダー</caption>
						<tr>
							<th>日</th>
							<th colspan="6">朝</th>
							<th colspan="6">昼</th>
							<th colspan="6">夜</th>
							<th colspan="6">未明</th>
							<th>備考</th>
						</tr>
					</thead>
				</table>`);
		let $tbody = $('<tbody></tbody>');
		for(var i = 0; i < io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Calendar.CONSTS.SUPPORTED_DAY; i++) {
			let $dayTr = $(`<tr 
						id="${this.id}-table-day-tr-${i}"
						class="${this.id}-table-day-tr">
							<th>${i+1}</th>
						</tr>`);
			for(var j = 0; j < io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Calendar.CONSTS.HOURS; j++) {
				$dayTr.append(`<td
					class="${this.tdClass}"
					id="${this.tdClass}-${j+i*24}"
					title="${i+1}日目 ${(j+6 < 24 ? j+6 : j-18) }時">未</td>`);
			}
			if(i === 25) {
				$dayTr.append(`<td>VC p.30参照</td>`);
			} else {
				$dayTr.append(`<td></td>`);
			}
			$tbody.append($dayTr);
		}
		$table.append($tbody);
		this.$dom.append($table);
	}
};
io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Calendar.CONSTS = {
	SUPPORTED_DAY: 30,
	HOURS: 24
};

io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.RndEvents = class {
	constructor($dom, status={}) {
		this.$dom = $dom;
		this.id = $dom.attr('id');
		this.clazz = `${this.id}-table-rndevent-td`;

		this.generateDom();
		this.bindEvents();

		const rndEvents = (status.rndEvents || '').split(',');
		rndEvents.forEach((v)=>{
			this.toggleEvent($(`#${this.clazz}-${v}`));
		});		
	}

	generateDom() {
		this.$dom.empty();
		this.$dom.append(this.generateTable());
		this.$dom.append(`<br/><button id="${this.id}-reset">ランダムイベントをリセット</button>`);
	}

	bindEvents() {
		$(`.${this.clazz}`).click((e)=>{ this.toggleEvent($(e.target)) });
		$(`#${this.id}-reset`).click((e)=>{
			this.generateDom();
			this.bindEvents();
		});
	}

	generateTable() {
		let $table = $(`<table id="${this.id}-table" border="1"><caption>ランダムイベント</caption></table>`);
		for(var i = 0; i < 5; i++) {
			let $tr = $(`<tr></tr>`);
			for(var j = 0; j < 6; j++) {
				$tr.append(`<td
					class="${this.clazz}"
					id="${this.clazz}-${i*6+j}">${i*6+j+1}
				</td>`);
			}
			$table.append($tr);
		}
		return $table;
	}
	getId($dom) {
		return Number($dom.attr('id').replace(`${this.clazz}-`, ''));
	}
	toggleEvent($dom) {
		if($dom.hasClass(`${this.clazz}-done`)) {
			$dom.text(this.getId($dom)+1);
			$dom.removeClass(`${this.clazz}-done`);
		} else {
			$dom.text('済');
			$dom.addClass(`${this.clazz}-done`);
		}
	}
	generateUrl() {
		const doneList = $(`.${this.clazz}-done`);
		let vals = [];
		doneList.each((i, v)=>{
			vals.push(this.getId($(v)));
		})
		return `rndEvents=${vals.join(',')}`;
	}
};

io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Trump30Table = class {
	constructor($dom, status={}) {
		this.$dom = $dom;
		this.id = $dom.attr('id');
		this.clazz = `${this.id}-table-td`;
		this.$dom.append(this.generateDom());
		(status.trump30 || '').split(',').forEach((id)=>{
			this.toggleEvent($(`#${this.clazz}-${id}`));
		});
		this.bindEvents();
	}
	getNum($dom) {
		return Number(/\d-(\d+)/.exec($dom.attr('id'))[1]);
	}
	getId($dom) {
		return /\d-\d+/.exec($dom.attr('id'))[0];
	}
	toggleEvent($dom) {
		if($dom.hasClass(`${this.clazz}-done`)) {
			$dom.removeClass(`${this.clazz}-done`);
		} else {
			$dom.addClass(`${this.clazz}-done`);
		}
	}
	bindEvents() {
		$(`.${this.id}-table-td`).click((e)=>{
			this.toggleEvent($(e.target));
		});
	}
	generateDom() {
		let $table = $(`<table border="1" id="${this.id}-table">
			<thead>
			<caption>チェックリスト</caption>
			<tr>
			${io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Trump30Table.TYPES.map((m)=>{
				return '<th colspan="3">' + m + '</th>\n'
			}).join('')}
			</tr></thead>
		</table>`);
		let $body = $('<tbody></tbody>');
		const clazz = this.clazz;
		const marks = io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Trump30Table.TYPES.length;
		for(var i = 0; i < (io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Trump30Table.LENGTH / 3); i++) {
			let $tr = $('<tr></tr>');
			for(var j = 0; j < marks; j++) {
				for(var k = 0; k < 3; k++) {
					$tr.append(`<td class="${clazz} ${clazz}-${j}" id="${clazz}-${j}-${i+k*10}">${i+k*10+1}</td>`)
				}			
			}
			$body.append($tr);
		}
		$table.append($body);
		return $table;
	}
	generateUrl() {
		let list = [];
		$(`.${this.clazz}-done`).each((i, v)=>{
			list.push(this.getId($(v)));
		});
		return `trump30=${list.join(',')}`;
	}
};
io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Trump30Table.LENGTH = 30;
io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Trump30Table.TYPES = ['♠','♥','♦','♣'];

io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Missions = class {
	constructor($dom, status={}) {
		this.$dom = $dom;
		this.id = $dom.attr('id');
		this.trClass = `${this.id}-tr`;
		this.clazz = `${this.id}-tr-select`;
		this.$select = `<select class="${this.clazz}"><option></option>` +
		io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Missions.MISSION_LIST.map((m, i)=>{
			return `<option value="${i}">${m}</option>`
		}).join('\n') + '</select>';
		this.acceptedMissons = (status.acceptedMissons || '').split(',').filter((d)=>{return d}).map((d)=>{return Number(d)}).sort((a,b)=>{return a-b});
		this.doneMissions = (status.doneMissions || '').split(',').filter((d)=>{return d}).map((d)=>{return Number(d)}).sort((a,b)=>{return a-b});
		this.$dom.append(this.generateDom());
		$(`#${this.id}-add`).click((e)=>{
			$(e.target).parent().parent().after(this.generateTr());
		});
	}

	generateTr(id = false, finished = false) {
		if(finished) {
			return `<tr class="${this.trClass}"><td>` + this.$select.replace(`value="${id}">`, `value="${id}" selected>`) + '</td><td><input type="checkbox" checked /></td></tr>';
		} else {
			if(id) {
				return `<tr class="${this.trClass}"><td>` + this.$select.replace(`value="${id}">`, `value="${id}" selected>`) + '</td><td><input type="checkbox" /></td></tr>';
			} else {
				return `<tr class="${this.trClass}"><td>` + this.$select + '</td><td><input type="checkbox" /></td></tr>';
			}
		}
	}

	generateDom() {
		let $table = $(`<table border="1"><thead><caption>ミッション一覧</caption></thead></table>`);
		let $tbody = $(`<tbody><tr><th>ミッション名</th><th>完了確認</th></tr></tbody>`);
		$tbody.append(`<tr><td colspan="2"><button id="${this.id}-add">新規ミッション</button></td></tr>`);
		$tbody.append(this.generateTr());
		this.acceptedMissons.forEach((m)=>{
			$tbody.append(this.generateTr(m, false));
		});
		this.doneMissions.forEach((m)=>{
			$tbody.append(this.generateTr(m, true));
		});
		$table.append($tbody);
		return $table;
	}

	generateUrl() {
		const trs = $(`.${this.trClass}`);
		let acceptedMissons = [];
		let doneMissions = [];
		
		trs.each((i, v)=>{
			const $tr = $(v);
			const isDone = $tr.find('input').prop('checked');
			const value = $tr.find('select').val();
			if(isDone) {
				doneMissions.push(value);
			} else {
				acceptedMissons.push(value);
			}
		});
		return `acceptedMissons=${acceptedMissons.join(',')}&doneMissions=${doneMissions.join(',')}`;
	}
};

io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Missions.MISSION_LIST = [
	"1: カリンの消息",
	"2: トリシアを訪ねて",
	"3: ミルタバル神殿の盗賊ギルド",
	"4: ティエラの困り事",
	"5: 観測地点巡回",
	"6: コロッサスの探索",
	"7: リーリャの護衛",
	"8: レイチェンを呼んできて",
	"9: エミーを救え",
	"10: 死体の買い付け",
	"11: 女給募集",
	"12: トリシアの救出",
	"13: 炎獣の洞窟を抜けて",
	"14: 救援",
	"15: 3人の奴隷",
	"16: 侍女の護衛",
	"17: ラビュサリスとともに",
	"18: 大祭への潜入",
	"19: チェザーリの使い",
	"20: ラビュサリスの奪還",
	"21: 北部への遠征",
	"22: 治安活動",
	"23: 行方不明者の捜索",
	"24: 死体捜索巡回",
	"25: 荷物の運搬",
	"26: 犯罪者の追跡"
];


io.github.shunshun94.trpg.scenarioTools.ViceCityCheck.Counters = class {
	constructor($dom, status={}) {
		this.id = $dom.attr('id');
		this.$dom = $dom;
		$dom.append(`
			<span>冒険者の店への剣のかけら納品数:<input id="${this.id}-shopPiece" type="number" value="${status.shopPiece || 0}" /></span><br/>
			<span>冒険者の店へのアビスシャード納品数:<input id="${this.id}-shopAbyss" type="number" value="${status.shopAbyss || 0}" /></span><br/>
			<span>黒剣騎士団への貢献度:<input id="${this.id}-blackSword" type="number" value="${status.blackSword || 0}" /></span><br/>
		`)
	}
	generateUrl() {
		return 'shopPiece=' + $(`#${this.id}-shopPiece`).val() +
		'&shopAbyss=' + $(`#${this.id}-shopAbyss`).val() +
		'&blackSword=' + $(`#${this.id}-blackSword`).val();
	}
};