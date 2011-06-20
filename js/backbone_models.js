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

var FireworkControls = Backbone.View.extend({
	el: ".fireworkControl"
});

var Fireworks = Backbone.Collection.extend({
	model: Firework
});

var FireworksShow = Backbone.View.extend({
	el: "#fireworks",
	
	initialize: function(){
		this.set({queue: new Fireworks()});
	},
	
	render: function(){
		
	}

});