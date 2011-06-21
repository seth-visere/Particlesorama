var Firework = Backbone.Model.extend({
	defaults: {
		xi: 0
	},
	
	initialize: function(){
//		this.spawns = new Fireworks();
		this.set({spawns: new Fireworks([])});
	},
	
	toJSON: function(){
		json = _.clone(this.attributes);
		return _.extend(json, {spawns: this.get("spawns").toJSON()});
	}
});

var FireworkControl = Backbone.View.extend({
	el: "li.fireworkControl"
});

var Fireworks = Backbone.Collection.extend({
	model: Firework
});

var FireworksShow = Backbone.View.extend({
	el: "#fireworksShow",
	
	initialize: function(){
		_.bindAll(this, "addOne");
		this.set({queue: new Fireworks()});
		this.get("queue").bind("add", this.addOne);
	},
	
	render: function(){
		
	},
	
	addOne: function(firework){
		var view = new FireworkControl({model: firework});
		this.$("#showQueue").append(view.render().el);
	}

});