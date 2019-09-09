Vue.component('shared-map-range', {
	props:['x', 'y'],
	template: `
	<div id="sharedMap-map-range"  :style="getStyle(200)" title="100">
		<div class="sharedMap-map-range-internal" :style="getStyleInternal(100, 200)" title="50">
			<div class="sharedMap-map-range-internal" :style="getStyleInternal(60, 100)" title="30">
				<div class="sharedMap-map-range-internal" :style="getStyleInternal(40, 60)" title="20">
					<div class="sharedMap-map-range-internal" :style="getStyleInternal(20, 40)" title="10">
						<div class="sharedMap-map-range-internal" :style="getStyleInternal(10, 20)" title="5">
							<div class="sharedMap-map-range-internal" :style="getStyleInternal(6, 10)" title="3"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>`,
	methods: {
		getStyle: function(width) {
			return `
				left:${this.x * config.scale}px;
				top:${this.y * config.scale}px;
				height:${width * config.scale}px;
				width:${width * config.scale}px;
				border-radius:${(width/2) * config.scale}px;
				transform:translate(-${(width/2) * config.scale - 13}px, -${(width/2) * config.scale - 13}px);`;
		},
		getStyleInternal: function(width, outsideWidth) {
			return `
				left:${(outsideWidth / 2) * config.scale}px;
				top:${(outsideWidth / 2) * config.scale}px;
				height:${width * config.scale}px;
				width:${width * config.scale}px;
				border-radius:${(width/2) * config.scale}px;
				transform:translate(-${(width/2) * config.scale}px, -${(width/2) * config.scale}px);`;
		}
	}
});