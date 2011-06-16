var container;
var camera, scene, renderer, particles, particle, geometry, material, materials, sphere;
var colors = [];
var image1Values;

$(function() {
	if (!Detector.webgl)
		Detector.addGetWebGLMessage();
	loadFireworksTest();
});

function loadFireworksTest() {

	init();
	animate();
}

var tweens = [];
var systems = [];

function startTweens() {
	// tweens[tweens.length-1].start();
	_.each(tweens, function(tween) {
		tween.start();
	});
}

function init() {

	container = $("#canvas2_wr");

	camera = new THREE.Camera(10, container.width() / container.height(), 1,
			5000);
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 3500;

	scene = new THREE.Scene();

	var PI2 = Math.PI * 2;
	var program = function(context) {

		// context.beginPath();
		// context.arc(0, 0, 1, 0, PI2, true);
		// context.closePath();
		// context.fill();
		// context.fillRect(0, 0, 1, 1);

	}

	var resolution = 4;


	var animationTime = 500;

	

//	scene.addObject(particleSystem);
//
//	var sphereMaterial = new THREE.MeshLambertMaterial({
//		color : 0xCC0000
//	});
//
//	for(var x=-500;x<=500;x+=100){
//		for(var y=-500;y<=500;y+=100){
////			for(var z=-500;z<=500;z+=100){
//				sphere = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 16), sphereMaterial);
//				sphere.position.x = x;	
//				sphere.position.y = y;	
////				sphere.position.z = z;	
////	tweens.push(new TWEEN.Tween(sphereMaterial.color).to({
////		r : 1,
////		g : 0,
////		b : 1
////	}, 2000));
//
//		scene.addObject(sphere);
////			}
//		}
//	}

	var light = new THREE.PointLight(0xffffff);
	light.position.x = 0;
	light.position.y = 0;
	light.position.z = 1000;
	scene.addLight(light);

	// renderer = new THREE.CanvasRenderer();
	renderer = new THREE.WebGLRenderer({
		clearAlpha : 1,
		autoClear: true
	});
	renderer.setSize(container.width(), container.height());

	container.html(renderer.domElement);
}

function returnToOrigin(pX, pY, pZ) {
	return function() {
		new TWEEN.Tween(this).to({
			x : pX,
			y : pY,
			z : pZ
		}, 1000).start();
	}
}

function spawn(){
	var particles = new THREE.Geometry();

	for(var i=0;i<Math.PI;i+=Math.PI/20){
		for(var j=0;j<2*Math.PI;j+=2*Math.PI/40){
			var particle = new THREE.Vertex(new THREE.Vector3(0, 0, 0));
			particle.velocity = new THREE.Vector3(Math.sin(i)*Math.cos(j), Math.sin(i)*Math.sin(j), Math.cos(i));
			particles.vertices.push(particle);
		}
	}
	var color = ((Math.random()/4+0.75)*0xffffff<<0).toString(16);
	var pMaterial = new THREE.ParticleBasicMaterial({
		color:"0x" + color,
//		color:"0xffff00",
		size:15,
		blending : THREE.AdditiveBlending
	});
	var particleSystem = new THREE.ParticleSystem(particles, pMaterial);
	particleSystem.position.x = Math.random()*800-400;
	particleSystem.position.y = Math.random()*400-100;
	particleSystem.position.z = Math.random()*100-50;
	new TWEEN.Tween(pMaterial).to({opacity : 0.0}, 5000).onComplete(function(){
		var oldSystem = systems.pop();
		scene.removeObject(oldSystem);
		}).start();
	
	systems.unshift(particleSystem);

	scene.addObject(particleSystem);
}

function animate() {

	// camera.position.z -= 2;
	if(systems.length > 1){
//		var oldSystem = systems.shift();
//		oldSystem.geometry.__dirtyVertices = true;
//		scene.removeObject(oldSystem);
	}
//	if(Math.random() < 1/(60*2)) spawn();
	
	TWEEN.update();

	for(var i=0;i<systems.length;i++){
		for(var j=0;j<systems[i].geometry.vertices.length;j++){
			systems[i].geometry.vertices[j].position.x += systems[i].geometry.vertices[j].velocity.x*2+2*Math.random()-0.5; 
			systems[i].geometry.vertices[j].position.y += systems[i].geometry.vertices[j].velocity.y*2+2*Math.random()-0.5; 
			systems[i].geometry.vertices[j].position.z += systems[i].geometry.vertices[j].velocity.z*2+2*Math.random()-0.5; 
			systems[i].geometry.vertices[j].velocity.y -= 0.01; 
		}
		systems[i].geometry.__dirtyVertices = true;
		systems[i].geometry.__dirtyColors = true;
	}
	render();

	requestAnimationFrame(animate);
}

function render() {
	// particleSystem.geometry.__dirtyColors = true;
	renderer.render(scene, camera);
}