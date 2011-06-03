var container;
var camera, scene, renderer, particles, particle, geometry, material, materials;
var colors = [];
var image1Values;

$(function() {
	if (!Detector.webgl)
		Detector.addGetWebGLMessage();

	$("#image2").bind(
			"load",
			function() {
				$("#canvas1").attr("width", ($("#image1").width()));
				$("#canvas1").attr("height", ($("#image1").height()));
				$("#canvas2_wr").css("width", ($("#image2").width()) + "px");
				$("#canvas2_wr").css("height", ($("#image2").height()) + "px");
				var canvasContext = $("#canvas1").get(0).getContext("2d");
				canvasContext.drawImage($("#image1").get(0), 0, 0, $("#image1")
						.width(), $("#image1").height());
				// var cvs2 = $("#canvas2").get(0).getContext("3d");
				var imageData = canvasContext.getImageData(0, 0, $("#image1")
						.width(), $("#image1").height());
				image1Values = analyzeImage(imageData);

				$("#canvas1").get(0).width = $("#canvas1").get(0).width;

				canvasContext.drawImage($("#image2").get(0), 0, 0, $("#image2")
						.width(), $("#image2").height());
				// var cvs2 = $("#canvas2").get(0).getContext("3d");
				imageData = canvasContext.getImageData(0, 0, $("#image2")
						.width(), $("#image2").height());
				image2Values = analyzeImage(imageData);

				init();
				animate();
			});

});

function analyzeImage(imageData) {
	return imageData;
}

var tweens = [];

function startTweens(){
//tweens[tweens.length-1].start();
		_.each(tweens, function(tween){
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
//		context.fillRect(0, 0, 1, 1);

	}

	var resolution = 4;

	var particles = new THREE.Geometry();
	
	for ( var dy = 0; dy < image1Values.height; dy += resolution) {
		for ( var dx = 0; dx < image1Values.width; dx += resolution) {

//			material = new THREE.ParticleBasicMaterial({
//				color : 0xffff00,
//				program : program
//			});
//
//			material.color.r = image1Values.data[offset] / 255;
//			material.color.g = image1Values.data[offset + 1] / 255;
//			material.color.b = image1Values.data[offset + 2] / 255;
//			material.opacity = image1Values.data[offset + 3] / 255;
//			material.color.updateStyleString();
//
//			particle = new THREE.Vertex(material);
//			particle.position.x = dx - image1Values.width / 2;
//			particle.position.y = image1Values.height / 2 - dy;
//			particle.position.z = 0;
//			particle.scale.x = particle.scale.y = resolution;
			// particle.materials[0].color.autoUpdate = true;

//			tweens.addChild(new ColorTween(particle.materials[0].color, "hex", Tween.regularEaseIn, material.color,  3);)
			
			
//			tweens.push(new TWEEN.Tween( particle.materials[0].color ) .to(
//			{r:image2Values.data[offset]/255,
//			g:image2Values.data[offset+1]/255,
//			b:image2Values.data[offset+2]/255}, 5000 )
//			.onUpdate(particle.materials[0].color.updateStyleString)
//			); 
//
//			tweens.push(new TWEEN.Tween( particle.materials[0] ) .to(
//			{opacity:image2Values.data[offset+3]/255}, 5000 )
//			.onUpdate(particle.materials[0].color.updateStyleString)
//			);

			
			offset = dy * image1Values.width * 4 + dx * 4;
			
			var pX = dx - image1Values.width/2,
				pY = image1Values.height/2 - dy,
				pZ = 0;
			
			var particle = new THREE.Vertex(new THREE.Vector3(pX, pY, pZ));
//			$("#debug").append("Pushed particle at " + pX + "," + pY +  "+" +pZ);
			particles.vertices.push(particle);

			var color = new THREE.Color(0xffffff);
			color.setRGB(image1Values.data[offset] / 255,image1Values.data[offset + 1] / 255,image1Values.data[offset + 2] / 255);
			particles.colors.push(color);

			

			var colorTween = new TWEEN.Tween(color).to({
				r:image2Values.data[offset]/255,
				g:image2Values.data[offset+1]/255,
				b:image2Values.data[offset+2]/255}, 2000);
			tweens.push(colorTween);


			var reverseTween = new TWEEN.Tween(particle.position).to({x:pX,y:pY,z:pZ}, 1000);
			var forwardTween = new TWEEN.Tween(particle.position).to({
				x:Math.random()*1000-500,
				y:Math.random()*1000-500,
				z:Math.random()*1000-500}, 1000);
			forwardTween.chain(reverseTween); 
//			.onComplete(returnToOrigin(pX,pY,pZ));
			
			tweens.push(forwardTween);

		}
	}

	var pMaterial = new THREE.ParticleBasicMaterial({
		size:resolution*16,
		vertexColors: true,
		blending: THREE.AdditiveBlending,
		map: THREE.ImageUtils.loadTexture("images/sprite.png")
	});

	
	particleSystem = new THREE.ParticleSystem(particles, pMaterial);
	
	scene.addObject(particleSystem);

	var sphereMaterial = new THREE.MeshLambertMaterial(
			{
			    color: 0xCC0000
			});
	

	var sphere = new THREE.Mesh(
			   new THREE.Sphere(50, 16, 16),
			   sphereMaterial);

	tweens.push(new TWEEN.Tween(sphereMaterial.color).to({r:1,g:0,b:1}, 2000));

//	scene.addObject(sphere);
	
	var light = new THREE.DirectionalLight(0xffffff);
	light.position.x = 0;
	light.position.y = 0;
	light.position.z = 1;
	scene.addLight(light);

//	renderer = new THREE.CanvasRenderer();
	 renderer = new THREE.WebGLRenderer({clearAlpha:1});
	renderer.setSize(container.width(), container.height());

	container.html(renderer.domElement);
}

function returnToOrigin(pX,pY,pZ){
	return function(){new TWEEN.Tween(this).to({x:pX, y:pY, z:pZ}, 1000).start();}
}

function animate() {

//	camera.position.z -= 2;

	
	TWEEN.update();
	
	particleSystem.geometry.__dirtyVertices = true;
	particleSystem.geometry.__dirtyColors = true;
	render();

	requestAnimationFrame(animate);
}

function render() {
//	particleSystem.geometry.__dirtyColors = true;
	renderer.render(scene, camera);
}