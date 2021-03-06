var io = io || {};
io.github = io.github || {};
io.github.shunshun94 = io.github.shunshun94 || {};
io.github.shunshun94.trpg = io.github.shunshun94.trpg || {};

io.github.shunshun94.trpg.ResponseChat = class extends com.hiyoko.DodontoF.V2.ChatClient {
	constructor($html, opt_options = {}) {
		super($html, opt_options);
		this.system = opt_options.system || '';
	}
	preventUnexpectedMessage(message) {
		if(io.github.shunshun94.trpg.ResponseChat.UNEXPECTED_MESSAGES.includes(message)) {
			return true;
		}
		if(/^\s+$/.test(message)) {
			return true;
		}
		return false;
	}
	bindEvents() {
		this.$html.on(this.display.id + '-getChatRequest', (e) => {
			this.fireEvent(this.getChatLogs(e.time).done(e.resolve).fail(e.reject));
		});
		this.$html.on(this.input.id + '-sendChatRequest', (e) => {
			if(this.preventUnexpectedMessage(e.args.message) && (! window.confirm("誤送信な気がします。本当に送りますか?"))) {
				return;
			}
			this.sendChat(e).done((result) => { 
				e.resolve(result);
				this.nameList.insertMember(e.args.name);
			}).fail(e.reject);
		});
		this.$html.on(io.github.shunshun94.trpg.ResponseChat.Display.Events.REPLY, (e) => {
			this.input.insertReply(e);
		});
		this.$html.on(io.github.shunshun94.trpg.ResponseChat.NameList.EVENTS.SELECT_NAME, (e) => {
			this.input.insertName(e.name);
		});
		this.$html.on(io.github.shunshun94.trpg.ResponseChat.Input.Events.QUICKINPUT, (e) => {
			this.quickinput.enable(500);
		});
		this.$html.on(io.github.shunshun94.trpg.ResponseChat.Input.Events.GET_ROOM_INFO, (e) => {
			this.fireEvent(this.getAsyncEvent(
				'tofRoomRequest', {method: 'getRoomInfo'}
			).done((result) => {
				e.resolve(result);
				this.display.insertChannels(result);
			}).fail(e.reject));
		});
		this.$html.on(io.github.shunshun94.trpg.ResponseChat.QuickInput.EVENTS.SEND_MSG, (e) => {
			if(this.input.getText()) {
				this.input.insertText(e.message);
			} else {
				this.sendChat({args: {
					name: this.input.getName(), message: e.message
				}}).fail((result) => {
					alert(`チャットの送信に失敗しました\n理由：${result.result}`);
				});
			}
		});
		this.autoUpdateTimer = setInterval(function(e) {this.display.update();}.bind(this), this.options.timer || 3000);
	}
	buildComponents() {
		this.display = new io.github.shunshun94.trpg.ResponseChat.Display(this.getElementById('display'), this.options);
		this.input = new io.github.shunshun94.trpg.ResponseChat.Input(this.getElementById('input'), this.options);
		this.nameList = new io.github.shunshun94.trpg.ResponseChat.NameList(this.getElementById('namelist'), this.options);
		this.quickinput = new io.github.shunshun94.trpg.ResponseChat.QuickInput(this.getElementById('quickinput'), this.options);
	};
	insertName(name) {
		this.input.insertName(name);
	}
};

io.github.shunshun94.trpg.ResponseChat.generateDom = (id) => {
	let dom = 	`<div id="${id}" class="${io.github.shunshun94.trpg.ResponseChat.CLASS}">
					<div id="${id}-namelist" class="${io.github.shunshun94.trpg.ResponseChat.CLASS}-child ${io.github.shunshun94.trpg.ResponseChat.NameList.CLASS}"></div>
					<div class="${io.github.shunshun94.trpg.ResponseChat.CLASS}-child">
						${io.github.shunshun94.trpg.ResponseChat.Input.generateDom(id)}
						<div id="${id}-display" class="${io.github.shunshun94.trpg.ResponseChat.Display.CLASS}"></div>
					</div>
					${io.github.shunshun94.trpg.ResponseChat.QuickInput.generateDom(id)}
				</div>`;
	return $(dom);
};

io.github.shunshun94.trpg.ResponseChat.CLASS = 'io-github-shunshun94-trpg-ResponseChat';
io.github.shunshun94.trpg.ResponseChat.UNEXPECTED_MESSAGES = ['[]', '""', `""`, '「」', '()', '（）', '<>', '＜＞'];

io.github.shunshun94.trpg.ResponseChat.NameList = class extends com.hiyoko.component.ApplicationBase {
	constructor($html, options = {}) {
		super($html, options);
		this.options = options;
		this.buildComponent(this.options.defaultNameList || []);
		this.bindEvents();
	}
	bindEvents() {
		this.$html.click((e) => {
			const $target = $(e.target);
			if($target.hasClass(`${this.id}-card`)) {
				this.fireEvent({
					type: io.github.shunshun94.trpg.ResponseChat.NameList.EVENTS.SELECT_NAME,
					name: $target.text()
				});
			}
		});
	}
	buildComponent(list) {
		if(list.length === 0) {
			list.push(this.options.defaultName || 'GM');
		}
		this.$html.append(
			list.map((name) => {
				const $dom = $(`<div class="${this.id}-card ${io.github.shunshun94.trpg.ResponseChat.NameList.CLASS}-card"></div>`);
				$dom.text(name);
				return $dom;
			})
		);
	}
	insertMember(name) {
		const list = this.getElementsByClass('card');
		const deleteTag = list.filter((i, dom) => {
			return $(dom).text() === name;
		});
		const $dom = $(`<div class="${this.id}-card ${io.github.shunshun94.trpg.ResponseChat.NameList.CLASS}-card"></div>`);
		$dom.text(name);
		this.getElementsByClass('card:first').before($dom);
		$(deleteTag).remove();
		this.fireEvent({
			type: io.github.shunshun94.trpg.ResponseChat.NameList.EVENTS.UPDATE_LIST
		});
	}
	
};
io.github.shunshun94.trpg.ResponseChat.NameList.CLASS = 'io-github-shunshun94-trpg-ResponseChat-namelist';
io.github.shunshun94.trpg.ResponseChat.NameList.EVENTS = {
	UPDATE_LIST: 'io-github-shunshun94-trpg-ResponseChat-namelist-EVENTS-UPDATE_LIST',
	SELECT_NAME: 'io-github-shunshun94-trpg-ResponseChat-namelist-EVENTS-SELECT_NAME'
};

io.github.shunshun94.trpg.ResponseChat.QuickInput = class extends com.hiyoko.component.ApplicationBase {
	constructor($html, options = {}) {
		super($html, options);
		this.options = options;
		this.buildComponents();
		this.eventBind();
	}
	buildComponents() {
		this.generateMenu();
		this.generateList();
	}
	
	generateMenu() {
		this.getElementById('menu').append((this.options.menu || io.github.shunshun94.trpg.ResponseChat.QuickInput.MENU).map((v, i) => {
			const dom = $(`<div id="${this.id}-quickinput-menu-item-${v.column}"
							class="${this.id}-quickinput-menu-item ${io.github.shunshun94.trpg.ResponseChat.QuickInput.CLASS}-menu-it em"></div>`);
			dom.text(v.label);
			return dom;
		}));
	}
	generateList(selected = 0) {
		this.getElementById('list').empty();
		const selectedItem = (this.options.menu || io.github.shunshun94.trpg.ResponseChat.QuickInput.MENU)[selected].column;
		this.getElementById('list').append((this.options.list || io.github.shunshun94.trpg.ResponseChat.QuickInput.DEFAULT_LIST)[selectedItem].map((item) => {
			return (this.options.menu || io.github.shunshun94.trpg.ResponseChat.QuickInput.MENU)[selected].generate(item, this.id);
		}));
	}
	eventBind() {
		this.getElementById('close').click((e) => {
			this.disable(300);
		});
		this.getElementById('list').click((e) => {
			const $dom = $(e.target);
			if($dom.hasClass(`${this.id}-list-item`)) {
				this.fireEvent({
					type: io.github.shunshun94.trpg.ResponseChat.QuickInput.EVENTS.SEND_MSG,
					message: $dom.find(`.${this.id}-list-item-value`).text()
				});
				this.disable(300);
			}
			if($dom.hasClass(`${this.id}-list-item-value`)) {
				this.fireEvent({
					type: io.github.shunshun94.trpg.ResponseChat.QuickInput.EVENTS.SEND_MSG,
					message: $dom.text()
				});
				this.disable(300);
			}
		});
	}
};
io.github.shunshun94.trpg.ResponseChat.QuickInput.MENU = [
	{label: '定型文', column: 'TEXT', generate: (item, id) => {
		var $dom = $(`<span class="${id}-list-item ${io.github.shunshun94.trpg.ResponseChat.QuickInput.CLASS}-list-item"></span>`);
		var $value = $(`<span class="${id}-list-item-value ${io.github.shunshun94.trpg.ResponseChat.QuickInput.CLASS}-list-item-value"></span>`);
		$value.text(item);
		$dom.append($value);
		return $dom;
	}}
];
io.github.shunshun94.trpg.ResponseChat.QuickInput.generateDom = (id) => {
	return `
		<div id="${id}-quickinput" class="${io.github.shunshun94.trpg.ResponseChat.QuickInput.CLASS}">
			<div id="${id}-quickinput-menu" class="${io.github.shunshun94.trpg.ResponseChat.QuickInput.CLASS}-menu"></div>
			<div id="${id}-quickinput-list" class="${io.github.shunshun94.trpg.ResponseChat.QuickInput.CLASS}-list"></div>
			<div id="${id}-quickinput-close" class="${io.github.shunshun94.trpg.ResponseChat.QuickInput.CLASS}-close">×</div>
		</div>
	`;
};
io.github.shunshun94.trpg.ResponseChat.QuickInput.CLASS = 'io-github-shunshun94-trpg-ResponseChat-quickinput';
io.github.shunshun94.trpg.ResponseChat.QuickInput.DEFAULT_LIST = {
		TEXT: [	'判定どうぞ', '判定、ちょっと待ってください',
				'何を対象にとりますか?', '何に対してやりますか?',
				'さて、どうしますか？', '状況の描写は以上です。どうしますか?',
				'面白いアイディアですね、考えさせてください', 'ちょっと考える時間をもらえますか?',
				'3分ほど席を外します', '5分ほど席を外します', '10分ほど席を外します', '戻りました',
				'では、5分ほど休憩にしましょうか', '煮詰まってますし、10分ほど休憩しますか?',
				'区切りもいいですし、1時間ほど休憩しますか?', 'では、日を改めましょうか。次回はいつにしましょうか',
				'その通りです', 'それは違いますね', 'それは明言できませんね。ご想像にお任せします', '明言してしまいますが、それは無いですね']
};
io.github.shunshun94.trpg.ResponseChat.QuickInput.EVENTS = {
	SEND_MSG: 'io-github-shunshun94-trpg-ResponseChat-quickinput-EVENTS-SEND_MSG'
};

io.github.shunshun94.trpg.ResponseChat.Display = class extends com.hiyoko.component.ApplicationBase {
	constructor($html, opt_options) {
		super($html, opt_options);
		this.options = opt_options || {};
		this.$html.addClass(io.github.shunshun94.trpg.ResponseChat.Display.CLASS);
		this.isSuspended = false;
		this.lastUpdate = 0;
		this.limit = this.options.displayLimit || 0;
		this.channels = ['メイン'];
		this.msgConverte = this.options.msgConverte || this.options.msgConverter;
		this.bindEvents();
	}
	
	buildComponents() {}
	bindEvents() {
		this.$html.click((e) => {
			const $dom = $(e.target);
			if($dom.hasClass(`${io.github.shunshun94.trpg.ResponseChat.Display.CLASS}-log-reply`)) {
				const name = $dom.parent().find(`.${io.github.shunshun94.trpg.ResponseChat.Display.CLASS}-log-name`).text();
				const message = $dom.parent().find(`.${io.github.shunshun94.trpg.ResponseChat.Display.CLASS}-log-message`).textWithLF();
				this.fireEvent({
					type: io.github.shunshun94.trpg.ResponseChat.Display.Events.REPLY,
					name: name, message: message, channel: $dom.prop('title')
				});
				$dom.addClass(`${io.github.shunshun94.trpg.ResponseChat.Display.CLASS}-log-reply-clicked ${this.id}-log-reply-clicked`);
			}
 		});
	}
	update() {
		if(this.isSuspended) {
			console.log('Chat update is suspended.');
			return;
		}
		this.isSuspended = true;
		var event = this.getAsyncEvent(this.id + '-getChatRequest', {time: this.lastUpdate}).done((result) => {
			this.isSuspended = false;
			this.receptData(result);
		}).fail((err) => {
			this.isSuspended = false;
			console.warn(err);
			const time = Number(new Date()) / 100;
			this.updateLogs([{
				time: Number(new Date()) / 100,
				id: '0',
				msg: 'チャットログの取得に失敗しました',
				color: 'FF0000',
				name: 'システムメッセージ',
				status: 'ERROR',
				tab: 0,
				vote: false,
				fixed: true,
				cutIn: false
			}]);
		});
		this.fireEvent(event);
	}
	receptData(data) {
		if(data.chatMessageDataLog.length) {
			const list = data.chatMessageDataLog.map(function(log){return com.hiyoko.DodontoF.V2.fixChatMsg(log);});
			this.updateLogs(list);
			const lastMsg = list[list.length - 1];
			this.lastUpdate = ((lastMsg.id === '0') ? lastMsg.time : lastMsg.id);
		}
	}
	updateLogs(logs) {
		this.$html.prepend(logs.map((log) => {
			if(this.msgConverte) {
				log = this.msgConverte(log);
			}
			let $log = $(`<div style="color:#${log.color}" class="${this.id}-log ${io.github.shunshun94.trpg.ResponseChat.Display.CLASS}-log"></div>`);
			if(log.tab) {
				$log.addClass(`${this.id}-log-notMain`);
				$log.addClass(`${io.github.shunshun94.trpg.ResponseChat.Display.CLASS}-log-notMain`);
			}

			let $name = $(`<span class="${this.id}-log-name ${io.github.shunshun94.trpg.ResponseChat.Display.CLASS}-log-name"></span>`);
			$name.text(log.name);

			var $msg = $(`<span class="${this.id}-log-message ${io.github.shunshun94.trpg.ResponseChat.Display.CLASS}-log-message"></span>`);
			$msg.textWithLF(log.msg);
			$log.append($name);
			if(log.tab) {
				$log.append(`　[${this.channels[log.tab]}]`);
			}
			$log.append($msg);
			$log.append(`<span title="${log.tab}" class="${this.id}-log-reply ${io.github.shunshun94.trpg.ResponseChat.Display.CLASS}-log-reply">💬</span>`)
			return $log;
		}).reverse());
		
		if(this.limit) {
			var count = this.getElementsByClass(com.hiyoko.DodontoF.V2.ChatClient.SimpleDisplay.CLASS + '-log').length;
			this.getElementsByClass(`log:gt(${this.limit + 1})`).remove();
		}
	}
	insertChannels(channels) {
		this.channels = channels.chatTab || channels;
	}
};
io.github.shunshun94.trpg.ResponseChat.Display.CLASS = 'io-github-shunshun94-trpg-ResponseChat-display';
io.github.shunshun94.trpg.ResponseChat.Display.Events = {
	REPLY: 'io-github-shunshun94-trpg-ResponseChat-Display-Events-REPLY'
};

io.github.shunshun94.trpg.ResponseChat.Input = class extends com.hiyoko.component.ApplicationBase {
	constructor($html, options = {}) {
		super($html, options);
		this.$name = this.getElementById('name');
		this.$text = this.getElementById('text');
		this.tabLength = 1;
		this.bindEvents();
		this.defaultName = options.defaultName || 'GM';
		this.GMColor = this.GMColor || this.defaultColor || this.color || '000000';
		this.NPCColor = this.NPCColor || this.defaultColor || this.color || '222222';
		this.$name.val(this.defaultName);
		this.setChannelList();
	}
	bindEvents() {
		this.$text.on('paste', (e) => {
			this.pasteText(e);
		});
		this.$text.keypress((e) => {
			this.whenPushKey(e);
		});
		this.getElementById('quickmenu').click((e) => {
			this.fireEvent({
				type: io.github.shunshun94.trpg.ResponseChat.Input.Events.QUICKINPUT
			});
		});
		this.getElementById('channel').change((e) => {
			const tab = Number(this.getElementById('channel').val());
			if(tab) {
				this.$html.css('background-color', `hsl(${(360) * (tab / this.tabLength)}, 100%, 85%)`);
			} else {
				this.$html.css('background-color', 'white');
			}
		});
	}
	setChannelList() {
		const event = this.getAsyncEvent(io.github.shunshun94.trpg.ResponseChat.Input.Events.GET_ROOM_INFO,
				{method: 'getRoomInfo', args: []}).done((result) => {
			this.tabLength = result.chatTab.length;
			result.chatTab.forEach((name, i) => {
				this.getElementById('channel').append(`<option value="${i}">${name}</option>`);
			});
			if(result.chatTab.length <= 1) {
				this.getElementById('channel').hide();
			}
		}).fail((result) => {
			console.warn(result);
			alert(`チャットタブ一覧の取得に失敗しました\n${result.result || result}`);
		});
		setTimeout(()=>{this.fireEvent(event)},50);
	}
	insertReply(target) {
		let text = this.$text.val();
		this.$text.val(`@${target.name}\n> ${target.message.replace(/\n/gm, '\n> ')}\n\n${text}`);
		this.getElementById('channel').val(target.channel);
		this.getElementById('channel').change();
	}
	getColor() {
		return (this.getName() === this.defaultName) ? this.GMColor : this.NPCColor;
	}
	getName() {
		return this.$name.val() || this.defaultName;
	}
	insertName(name) {
		this.$name.val(name);
	}
	getText() {
		return this.$text.val();
	}
	insertText(message) {
		this.$text.val(`${this.getText()}\n${message}`);
	}
	pasteText(event) {
		const e = event.originalEvent;
		const text = e.clipboardData.getData('text');
		if(! Boolean(text)) {
			return;
		}
		if(text.startsWith('http')) {
			return;
		}
		const regs = [
			/^([^:：\n]+)[:：]?「([^「]*)」/,
			/^([^:：\n]+)[:：]([^「]*)/
		];
		
		const result = regs.map((re, i) => {return re.exec(text)}).filter((re) => {return re});
		if(result.length) {
			this.$name.val(result[0][1]);
			this.$text.val(`「${result[0][2]}」`);
			event.preventDefault();
		}
	}
	whenPushKey(event) {
		const e = event.originalEvent;
		if(e.key === 'Enter' && (! e.shiftKey)) {
			const name = this.$name.val();
			const text = this.$text.val();
			const msg = this.getAsyncEvent(`${this.id}-sendChatRequest`, {
				args: {	name: name,
						message: text,
						color: (name === this.defaultName) ? this.GMColor : this.NPCColor,
						channel: this.getElementById('channel').val()
				}
			}).done(function(result) {
				// no action
			}.bind(this)).fail((result) => {
				this.$text.val(text);
				alert(`チャットの送信に失敗しました\n理由：${result.result}`);
			});
			this.fireEvent(msg);
			event.preventDefault();
			this.$text.val('');
		}
	}
};

io.github.shunshun94.trpg.ResponseChat.Input.generateDom = (id) => {
	return `<div id="${id}-input" class="${io.github.shunshun94.trpg.ResponseChat.Input.CLASS}">
				<div>
					${io.github.shunshun94.trpg.ResponseChat.Input.TEXT.NAME}
					<input id="${id}-input-name" class="${io.github.shunshun94.trpg.ResponseChat.Input.CLASS}-name" type="text"/>
					<span id="${id}-input-quickmenu" class="${io.github.shunshun94.trpg.ResponseChat.Input.CLASS}-quickmenu"></span>
					<select id="${id}-input-channel" class="${io.github.shunshun94.trpg.ResponseChat.Input.CLASS}-channel"></select>
				</div>
				<textarea id="${id}-input-text" class="${io.github.shunshun94.trpg.ResponseChat.Input.CLASS}-text" contenteditable></textarea>
				<p class="${io.github.shunshun94.trpg.ResponseChat.Input.CLASS}-borderText">${io.github.shunshun94.trpg.ResponseChat.Input.TEXT.ABOUT_RETURN}</p>
			</div>`;
};

io.github.shunshun94.trpg.ResponseChat.Input.TEXT = {
	ABOUT_RETURN: 'Shift+Enter で改行。Enter で送信',
	NAME: '名前'
};
io.github.shunshun94.trpg.ResponseChat.Input.CLASS = 'io-github-shunshun94-trpg-ResponseChat-input'
io.github.shunshun94.trpg.ResponseChat.Input.Events = {
	QUICKINPUT: 'io-github-shunshun94-trpg-ResponseChat-input-EVENTS-QUICKINPUT',
	GET_ROOM_INFO: 'io-github-shunshun94-trpg-ResponseChat-input-EVENTS-GET_ROOM_INFO'
};
