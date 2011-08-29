var container;
var camera, scene, renderer, particleSystems, systemCount, particle, geometry, material, materials;
var colors = [];
var image1Values;

var uniforms;
var settings = new Object();

$(function() {
	if (!Detector.webgl)
		Detector.addGetWebGLMessage();
	systemCount = 3;
	particleSystems = [];
	settings.rotate = false;
	loadTransitionTest();
//	loadFireworksTest();
});

function loadTransitionTest() {
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
}


function analyzeImage(imageData) {
	return imageData;
}

var tweens = [];

function startTweens() {
	// tweens[tweens.length-1].start();
//	_.each(tweens, function(tween) {
//		tween.start();
//	});
	TWEEN.stop();
	TWEEN.removeAll();
	uniforms.t.value = 0;
	new TWEEN.Tween(uniforms.t).to({value:3}, 5000).easing(TWEEN.Easing.Quartic.EaseInOut).onUpdate(function(){
		rotate();
	}).start();
	
}

function init() {

	container = $("#canvas2_wr");

	camera = new THREE.Camera(10, container.width() / container.height(), 1,
			5000);
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 3200;

	scene = new THREE.Scene();

	var PI2 = Math.PI * 2;
	var program = function(context) {

		// context.beginPath();
		// context.arc(0, 0, 1, 0, PI2, true);
		// context.closePath();
		// context.fill();
		// context.fillRect(0, 0, 1, 1);

	}

	var resolution = 1;
	var particles = [];
	for(i=0;i<systemCount;i++){
		particles[i] = new THREE.Geometry();
	}

	var animationTime = 500;

	for ( var dy = 0; dy < image1Values.height; dy += resolution) {
		for ( var dx = 0; dx < image1Values.width; dx += resolution) {

			
			
			offset = dy * image1Values.width * 4 + dx * 4;

			var pX = dx - image1Values.width / 2, pY = image1Values.height / 2
					- dy, pZ = 0;

			var particle = new THREE.Vertex(new THREE.Vector3(pX, pY, pZ));
			// $("#debug").append("Pushed particle at " + pX + "," + pY + "+"
			// +pZ);
			particles[(dx+dy)%systemCount].vertices.push(particle);

			continue;
			
			var color = new THREE.Color(0xffffff);
			color.setRGB(image1Values.data[offset] / 255,
					image1Values.data[offset + 1] / 255,
					image1Values.data[offset + 2] / 255);
			particles.colors.push(color);

			var colorTween = new TWEEN.Tween(color).to({
				r : image2Values.data[offset] / 255,
				g : image2Values.data[offset + 1] / 255,
				b : image2Values.data[offset + 2] / 255
			}, animationTime).delay(animationTime);
			tweens.push(colorTween);

			var position3Tween = new TWEEN.Tween(particle.position).to({
				x : pX,
				y : pY,
				z : pZ
			}, animationTime);

			var position2Tween = new TWEEN.Tween(particle.position).to({
				x : image2Values.data[offset] / 255 * 500 - 250,
				y : image2Values.data[offset + 1] / 255 * 500 - 250,
				z : image2Values.data[offset + 2] / 255 * 500 - 250
			}, animationTime);

			position2Tween.chain(position3Tween);

			var position1Tween = new TWEEN.Tween(particle.position).to({
				x : image1Values.data[offset] / 255 * 500 - 250,
				y : image1Values.data[offset + 1] / 255 * 500 - 250,
				z : image1Values.data[offset + 2] / 255 * 500 - 250
			}, animationTime);

			position1Tween.chain(position2Tween);

			// var forwardTween = new TWEEN.Tween(particle.position).to({
			// x:Math.random()*1000-500,
			// y:Math.random()*1000-500,
			// z:Math.random()*1000-500}, 1000);

			// .onComplete(returnToOrigin(pX,pY,pZ));

			tweens.push(position1Tween);
			tweens.push(colorTween);

		}
	}

//	var pMaterial = new THREE.ParticleBasicMaterial({
//		size : resolution * 16,
//		vertexColors : true,
//		blending : THREE.AdditiveBlending
//	});

	uniforms = {
			mode : {
				type : "i",
				value : 0
			},
			t : {
				type : "f",
				value : 0
			},
			resolution : {
				type : "f",
				value : resolution
			}
		};
	
	uniforms.texture = {
		type : "t",
		value : 0,
		texture : THREE.ImageUtils.loadTexture("images/1.png")
	};
	uniforms.texture2 = {
		type : "t",
		value : 1,
		texture : THREE.ImageUtils.loadTexture("images/2.png")
	};
	
	var shaderMaterial = new THREE.MeshShaderMaterial({
		vertexShader : $('#vertexshader').text(),
		fragmentShader : $('#fragmentshader').text(),
		uniforms : uniforms,
		attributes : {},
		size : 10,
		blending : THREE.AdditiveBlending,
		wireframe : false
	});
	
	for(i=0;i<systemCount;i++){
		particleSystems[i] = new THREE.ParticleSystem(particles[i], shaderMaterial);
		scene.addObject(particleSystems[i]);
	}


	var sphereMaterial = new THREE.MeshBasicMaterial({
		color : 0xCC0000
	});

	var sphere = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 16), sphereMaterial);
	

//	 scene.addObject(sphere);

	var light = new THREE.PointLight(0xffffff);
	light.position.x = 0;
	light.position.y = 0;
	light.position.z = 1;
	scene.addLight(light);

	// renderer = new THREE.CanvasRenderer();
	renderer = new THREE.WebGLRenderer({
		clearAlpha : 0,
		antialias : false
	});
	renderer.setSize(container.width(), container.height());

	container.html(renderer.domElement);
	
	gui = new DAT.GUI();
	gui.add(uniforms.t, "value").min(0).max(3).listen().onChange(function(val){
		rotate();
	});
	gui.add(camera.position, "x").min(-1000).max(1000);
	gui.add(camera.position, "y").min(-1000).max(1000);
	gui.add(camera.position, "z").min(0000).max(5000);
	
	gui.add(settings, "rotate");
	gui.add(window, "startTweens");
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

function rotate(){
	if(settings.rotate){
	for(i=0;i<systemCount;i++){
		particleSystems[i].rotation.x = particleSystems[i].rotation.y = particleSystems[i].rotation.z = (Math.pow(-1,i))*((i+1))*Math.PI*uniforms.t.value/3;
		//particleSystems[i].position.x = 100*(Math.pow(-1,i))*Math.sin(2*Math.PI*uniforms.t.value/3);
		//particleSystems[i].position.y = 100*(Math.pow(-1,i))*-Math.sin(6*Math.PI*uniforms.t.value/3);
		//particleSystems[i].position.z = 100*(Math.pow(-1,i))*Math.sin(4*Math.PI*uniforms.t.value/3);
	}
	}
}

function animate() {

	// camera.position.z -= 2;

	TWEEN.update();

	//particleSystem.geometry.__dirtyVertices = true;
	//particleSystem.geometry.__dirtyColors = true;
	render();

	requestAnimationFrame(animate);
}

function render() {
	// particleSystem.geometry.__dirtyColors = true;
	renderer.render(scene, camera);
}