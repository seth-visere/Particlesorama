var Firework = Backbone.Model.extend({
	defaults: {exploded:false,delay:0,fuse:2000,r:255,g:255,b:255,xi:0,yi:-320,zi:0,xrings:10,zrings:10},

	initialize: function(){
		_.bindAll(this, "fire");
		if(this.get("xf") == undefined) this.set({xf:Math.random()*800-400});
		if(this.get("yf") == undefined) this.set({yf:Math.random()*400-100});
		if(this.get("zf") == undefined) this.set({zf:Math.random()*100-50});
		this.set({spawns: new Fireworks([])});
	},
	
	fire: function(){		
		spawn($.extend(true, {}, this));
	},
	
	addSpawn: function(){
		this.get("spawns").add(new Firework({xi:this.get("xf"), yi:this.get("yf"), zi:this.get("zf")}));
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
		_.bindAll(this, "addOne");
		this.gui = new DAT.GUI();
		this.model.view = this;
		this.model.get("spawns").bind("add", this.addOne);
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
			this.gui.add(this.model,"addSpawn").name("Add Spawn");
			this.gui.add(this.model,"fire").name("Fire!");
			this.gui.open(); //Set correct height
		}
		return this;
	},
	
	addOne: function(spawn){
		
	}
});

var Fireworks = Backbone.Collection.extend({
	model: Firework
});

var FireworksShow = Backbone.View.extend({
	el: $("#fireworksShow"),
	
	initialize: function(){
		this.el = $("#fireworksShow");
		_.bindAll(this, "addOne", "removeOne", "startShow", "saveShow");
		this.queue = new Fireworks();
		this.queue.bind("add", this.addOne);
		this.queue.bind("remove", this.removeOne);
		this.queue.add(new Firework());
		this.queue.add(new Firework());
		this.$("#startShow").live("click", this.startShow);
		this.$("#saveShow").live("click", this.saveShow);
		this.$("#addFirework").live("click", $.proxy(function(){this.queue.add(new Firework());},this));
		var hashmatch = window.location.hash.match(/[a-f0-9]{40}/); 
		if(hashmatch && hashmatch.length > 0){
			var hash = hashmatch[0];
			$.ajax("http://" + location.host + ":7411/api", {
			data: {q: hash},
			statusCode: {
				200: function(data){
					console.log(data);
					while(fireworksShow.queue.length > 0){
						fireworksShow.queue.remove(fireworksShow.queue.at(0));
					}
					_.each(data, function(firework){
						fireworksShow.queue.add(new Firework(firework));
					});
//					fireworksShow.queue.add(data);
				},
				404: function(){
					alert("Error");
				}
			}
			});
		}
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
	
	removeOne: function(firework){
		$(firework.view.el).remove();
	},
	
	startShow: function(){
		var delay = 0;
		this.queue.forEach(function(firework){
			delay += firework.get("delay");
			setTimeout(firework.fire, delay);
		});
	},
	
	saveShow: function(){
		$.post("http://" + location.host + ":7411/api", {json: JSON.stringify(this.queue.toJSON())}, function(data){
			console.log(data);
//			var result = JSON.parse(result);
			var result = data;
			if(result.outcome == "OK") window.location.hash = "#" + result.hash;
			});
	}

});