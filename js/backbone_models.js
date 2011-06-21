var Firework = Backbone.Model.extend({
	defaults: {exploded:false,delay:0,fuse:2000,r:255,g:255,b:255,xi:0,yi:-320,zi:0,xf:Math.random()*800-400, yf:Math.random()*400-100, zf: Math.random()*100-50,xrings:10,zrings:10},

	initialize: function(){
		_.bindAll(this, "fire");
		this.set({spawns: new Fireworks([])});
	},
	
	fire: function(){		
		spawn($.extend(true, {}, this));
	},

	toJSON: function(){
		json = _.clone(this.attributes);
		return _.extend(json, {spawns: this.get("spawns").toJSON()});
	}
});

var FireworkControl = Backbone.View.extend({
	tagName: "li",
	className: "fireworkControl",
	
	initialize: function(){
		this.gui = new DAT.GUI();
	},
	
	render: function(){
		if(this.$(".guidat").length == 0){
			$(this.el).append(this.gui.domElement);
			this.gui.add(this.model,"delay",0,10000,1);
			this.gui.add(this.model,"r",0,255,1);
			this.gui.add(this.model,"g",0,255,1);
			this.gui.add(this.model,"b",0,255,1);
			this.gui.add(this.model,"xf",-400,400,1);
			this.gui.add(this.model,"yf",-400,400,1);
			this.gui.add(this.model,"zf",-100,100,1);
			this.gui.add(this.model,"xrings",1,100,1);
			this.gui.add(this.model,"zrings",1,100,1);
			this.gui.add(this.model,"fire").name("Fire!");
			this.gui.open(); //Set correct height
		}
		return this;
	}
});

var Fireworks = Backbone.Collection.extend({
	model: Firework
});

var FireworksShow = Backbone.View.extend({
	el: $("#fireworksShow"),
	
	initialize: function(){
		this.el = $("#fireworksShow");
		_.bindAll(this, "addOne", "startShow");
		this.queue = new Fireworks();
		this.queue.bind("add", this.addOne);
		this.queue.add(new Firework());
		this.queue.add(new Firework());
		this.$("#startShow").live("click", this.startShow);
	},
	
	render: function(){
		return this;
	},
	
	addOne: function(firework){
		var view = new FireworkControl({model: firework});
		this.$("#showQueue").append(view.el);
		//We have to call render after it's appended to let DAT GUI get its height set
		view.render();
	},
	
	startShow: function(){
		var delay = 0;
		this.queue.forEach(function(firework){
			delay += firework.get("delay");
			setTimeout(firework.fire, delay);
		});
	}

});