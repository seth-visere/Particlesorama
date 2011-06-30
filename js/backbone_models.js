var Firework = Backbone.Model.extend({
	defaults : {
		exploded : false,
		delay : 0,
		fuse : 2000,
		velocity : 1,
		randomness : 1,
		r : 255,
		g : 255,
		b : 255,
		x0 : 0,
		y0 : 0,
		z0 : 0,
		xi : 0,
		yi : -320,
		zi : 0,
		xrings : 10,
		zrings : 10
	},

	initialize : function() {
		_.bindAll(this, "fire", "onChange");
		if (this.get("xf") == undefined)
			this.set({
				xf : Math.random() * 800 - 400
			});
		if (this.get("yf") == undefined)
			this.set({
				yf : Math.random() * 400 - 100
			});
		if (this.get("zf") == undefined)
			this.set({
				zf : Math.random() * 100 - 50
			});
		if(!this.get("spawns")) this.set({spawns: new Fireworks()});
		this.bind("change", this.onChange);
		//		var spawns = this.get("spawns");
//		this.set({spawns: new Fireworks()});
//		if(spawns != undefined && spawns.length > 0){
//			this.get("spawns").add(spawns);
//		}
	},

	fire : function() {
		spawn($.extend(true, {}, this));
	},
	
	remove : function() {
		if(confirm("This will permanently delete this firework and any spawns! Continue?")) this.collection.remove(this);
	},

	addSpawn : function() {
		this.get("spawns").add(new Firework({
			xi : 0,
			yi : 0,
			zi : 0,
			x0 : this.get("xf")+this.get("x0"),
			y0 : this.get("yf")+this.get("y0"),
			z0 : this.get("zf")+this.get("z0")
		}));
	},
	
	onChange : function(){
		if(this.hasChanged("xf") || this.hasChanged("yf") || this.hasChanged("zf") || this.hasChanged("x0") || this.hasChanged("y0") || this.hasChanged("z0")){
			this.get("spawns").forEach(function(spawn){
				spawn.set({x0:this.get("xf")+this.get("x0"),y0:this.get("yf")+this.get("y0"),z0:this.get("zf")+this.get("z0")});
			},this);
		}
	},

	toJSON : function() {
		json = _.clone(this.attributes);
		return _.extend(json, {
			spawns : this.get("spawns").toJSON()
		});
	},
	
	parse : function(response){
		//We force recursive parses to get spawns to be properly converted to objects
		var spawns = response.spawns;		
		var spawnsColl = new Fireworks();
		for(var i=0;i<spawns.length;i++){
			spawnsColl.add(new Firework().parse(spawns[i]));
		}
		response.spawns = spawnsColl;
		return response;
	}
});

var FireworkControl = Backbone.View.extend({
	tagName : "li",
	className : "fireworkControl",

	initialize : function() {
		_.bindAll(this, "addOne", "removeOne");
		this.gui = new DAT.GUI();
		this.model.view = this;
		this.model.get("spawns").bind("add", this.addOne);
		this.model.get("spawns").bind("remove", this.removeOne);
	},

	render : function() {
		if (this.$(".guidat").length == 0) { //First render
			$(this.el).append(this.gui.domElement);
			this.gui.add(this.model, "delay", 0, 10000, 1);
			this.gui.add(this.model, "fuse", 0, 10000, 1);
			this.gui.add(this.model, "velocity", 0, 10, 0.1);
			this.gui.add(this.model, "randomness", 0, 1, 0.01);
			this.gui.add(this.model, "r", 0, 255, 1);
			this.gui.add(this.model, "g", 0, 255, 1);
			this.gui.add(this.model, "b", 0, 255, 1);
			this.gui.add(this.model, "xf", -900, 900, 1);
			this.gui.add(this.model, "yf", -600, 600, 1);
			this.gui.add(this.model, "zf", -100, 100, 1);
			this.gui.add(this.model, "xrings", 1, 100, 1);
			this.gui.add(this.model, "zrings", 1, 100, 1);
			this.gui.add(this.model, "addSpawn").name("Add Spawn");
			this.gui.add(this.model, "remove").name("Delete");
			this.gui.add(this.model, "fire").name("Fire!");
			this.gui.open(); // Set correct height
			$(this.el).append("<ul class='fireworksQueue spawnQueue'><li class='queueHeader' style='display:none;'><div class='ui-state-default queueToggle'><span class='ui-icon ui-icon-circlesmall-minus'></span></div></li></ul>");
			this.model.get("spawns").el = this.$(">.fireworksQueue");
			this.model.get("spawns").each(function(spawn){this.addOne(spawn);},this);
			this.$(">.fireworksQueue>.queueHeader>.queueToggle").bind("click", $.proxy(function(){
				if(this.$(">.fireworksQueue>.queueHeader>.queueToggle>span").hasClass("ui-icon-circlesmall-plus")){
					this.model.get("spawns").openAll();
				}else{
					this.model.get("spawns").closeAll();
				}
			}, this));
		}
		return this;
	},

	addOne : function(spawn) {
		this.$(">.spawnQueue>.queueHeader").show();
		var view = new FireworkControl({model:spawn});
		this.$(">.spawnQueue").append(view.el);
		//Render after attachment to get proper height
		view.render()
	},
	
	removeOne : function(spawn) {
		$(spawn.view.el).remove();
	}

});

var Fireworks = Backbone.Collection.extend({
	model : Firework,
	
	initialize: function(){
		_.bindAll(this, "openAll", "closeAll");
	},
	
	openAll : function(){
		this.forEach(function(firework){
			firework.get("spawns").openAll();
			firework.view.gui.open();
			$(this.el).find(">.queueHeader>.queueToggle>span").removeClass("ui-icon-circlesmall-plus");
			$(this.el).find(">.queueHeader>.queueToggle>span").addClass("ui-icon-circlesmall-minus");
		},this);
	},

	closeAll : function(){
		this.forEach(function(firework){
			firework.get("spawns").closeAll();
			firework.view.gui.close();
			$(this.el).find(">.queueHeader>.queueToggle>span").addClass("ui-icon-circlesmall-plus");
			$(this.el).find(">.queueHeader>.queueToggle>span").removeClass("ui-icon-circlesmall-minus");
		},this);
	}
});

var FireworksShow = Backbone.View.extend({
	el : $("#fireworksShow"),

	initialize : function() {
		this.el = $("#fireworksShow");
		_.bindAll(this, "addOne", "removeOne", "startShow", "saveShow",
				"loadShow");
		this.queue = new Fireworks();
		this.queue.el = this.$(">.fireworksQueue");
		this.queue.bind("add", this.addOne);
		this.queue.bind("remove", this.removeOne);
		this.queue.add(new Firework());
		this.queue.add(new Firework());
		this.queue.add(new Firework());
		this.$("#newShow").live("click", function(){if(confirm('This will remove all fireworks and create a new show! Continue?')) location.href = location.origin + location.pathname});
		this.$("#startShow").live("click", this.startShow);
		this.$("#saveShow").live("click", this.saveShow);
		this.$("#addFirework").live("click", $.proxy(function() {
			this.queue.add(new Firework());
		}, this));
		$(window).bind("hashchange", this.loadShow);
		$(window).trigger("hashchange");
		this.$(">.fireworksQueue>.queueHeader>.queueToggle").bind("click", $.proxy(function(){
			if(this.$(">.fireworksQueue>.queueHeader>.queueToggle>span").hasClass("ui-icon-circlesmall-plus")){
				this.queue.openAll();
			}else{
				this.queue.closeAll();
			}
		}, this));
	},

	render : function() {
		return this;
	},

	addOne : function(firework) {
		var view = new FireworkControl({
			model : firework
		});
		this.$("#showQueue").append(view.el);
		// We have to call render after it's appended to let DAT GUI get its
		// height set
		view.render();
	},

	removeOne : function(firework) {
		$(firework.view.el).remove();
	},

	startShow : function() {
		var delay = 0;
		this.queue.forEach(function(firework) {
			delay += firework.get("delay");
			setTimeout(firework.fire, delay);
		});
	},

	saveShow : function() {
		$.post("http://" + "173.255.248.45" + ":7411/api", {
			json : JSON.stringify(this.queue.toJSON())
		}, function(data) {
			console.log(data);
			// var result = JSON.parse(result);
			var result = data;
			if (result.outcome == "OK")
				window.location.search = "";
				window.location.hash = "#" + result.hash;
		});
	},

	loadShow : function() {
		var hashmatch = window.location.hash.match(/[a-f0-9]{40}/);
		if (hashmatch && hashmatch.length > 0) {
			var hash = hashmatch[0];
			$.ajax("http://" + "173.255.248.45" + ":7411/api", {
				data : {
					q : hash
				},
				statusCode : {
					200 : $.proxy(function(data) {
						console.log(data);
						while (this.queue.length > 0) {
							this.queue.remove(this.queue
									.at(0));
						}
						_.each(data, function(firework) {
							this.queue.add(new Firework().parse(firework));
						}, this);
						if(location.search.match(/autoplay=true/) != null){
							this.startShow();
						}
						// fireworksShow.queue.add(data);
					},this),
					404 : function() {
						alert("Error");
					}
				}
			});
		}
	}

});