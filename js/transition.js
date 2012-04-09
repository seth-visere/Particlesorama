$(function() {
	this.currentPage = 0;

	/* SHADER TEST CODE FROM AEROTWIST */
	// set the scene size
	this.PAGE_HEIGHT = 540;
	this.PAGE_WIDTH = 737;
	/* SHADER TEST CODE FROM AEROTWIST */
	// set the scene size
	// Scene width is limited by web page frame
	var WIDTH = this.PAGE_WIDTH, HEIGHT = this.PAGE_HEIGHT;

	// set some camera attributes
	var VIEW_ANGLE = 25, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 10000;

	// get the DOM element to attach to
	// - assume we've got jQuery to hand

	// create a WebGL renderer, camera
	// and a scene
	this.glrenderer = new THREE.WebGLRenderer({
		antialias : true,
		clearColor: 0x000000,
		clearAlpha : 0
	});

	// Turn off sorting to make sure the cover is drawn first
	// and visible underneath the pages
	this.glrenderer.sortObjects = true;

	this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	this.scene = new THREE.Scene();
	
	this.scene.add(this.camera);

	// the camera starts at 0,0,0 so pull it back
	this.camera.position.set(0,0,1200);

	this.pointLight = new THREE.PointLight(0xffffff);
	this.pointLight.position.set(0,0,0);
	this.scene.add(this.pointLight);
	
	// start the renderer
	this.glrenderer.setSize(WIDTH, HEIGHT);

	var aSphereMat = new THREE.MeshLambertMaterial({
		color : 0xcc0000
	});
	aSphere = new THREE.Mesh(new THREE.SphereGeometry(10, 5, 5), aSphereMat);
	aSphere.position.x = 0;
	aSphere.position.y = 0;
	aSphere.position.z = 30;

	this.scene.add(aSphere);

	var oSphereMat = new THREE.MeshLambertMaterial({
		color : 0x0000cc
	});
	oSphere = new THREE.Mesh(new THREE.SphereGeometry(10, 5, 5), oSphereMat);
	oSphere.position.x = 0;
	oSphere.position.y = 0;
	oSphere.position.z = 0;

	this.scene.add(oSphere);

	// Add back cover
	var width = this.PAGE_WIDTH, height = this.PAGE_HEIGHT, widthsegments = 92 * 4, heightsegments = 64 * 4;

	var $container = $('#webgl_wr');
	// attach the render-supplied DOM element
	$container.append(this.glrenderer.domElement);
	$(this.glrenderer.domElement).css("border", "1px solid red");
	$(this.glrenderer.domElement).bind("click", function(e) {
		// Handle clicks to show/hide card
	});

	$(this.glrenderer.domElement).bind("mousemove", $.proxy(function(e) {
		e.stopPropagation();
//		this.camera.position.x = 2 * ($(this.glrenderer.domElement).width() - e.layerX * 2);
//		this.camera.position.y = 2 * ($(this.glrenderer.domElement).height() - e.layerY * 2);
	}, this));

	this.dummy = {
			t : 0
		};
		this.uniforms = {
			mode : {
				type : "i",
				value : 0
			},
			t : {
				type : "f",
				value : 0
			},
			A : {
				type : "f",
				value : this.PAGE_HEIGHT * 1.5
			},
			theta : {
				type : "f",
				value : -Math.PI / 2
			},
			rho : {
				type : "f",
				value : 0
			}
		};
	
	this.uniforms.texture = {
		type : "t",
		value : 0,
		texture : THREE.ImageUtils.loadTexture("images/1.png")
	};
	this.uniforms.texture2 = {
		type : "t",
		value : 1,
		texture : THREE.ImageUtils.loadTexture("images/2.png")
	};

	var planeGeo = new THREE.PlaneGeometry(width, height, widthsegments, heightsegments);

	// create the sphere's material
	var shaderMaterial = new THREE.ShaderMaterial({
		vertexShader : $('#vertexshader').text(),
		fragmentShader : $('#fragmentshader').text(),
		uniforms : this.uniforms,
		attributes : {},
		blending : THREE.AdditiveBlending,
		wireframe : true
	});
	
	var basicMaterial = new THREE.MeshBasicMaterial({
		color : 0xff0000,
		wireframe : true
	});

	pagePlane = new THREE.Mesh(planeGeo, shaderMaterial);
//	pagePlane = new THREE.Mesh(planeGeo, basicMaterial);
	pagePlane.doubleSided = true;
	pagePlane.transparent = true;
	pagePlane.position.x = 0;
	pagePlane.position.y = 0;
	pagePlane.position.z = 0;
	this.scene.add(pagePlane);
	this.globject = pagePlane;

	gui = new DAT.GUI();

	gui.add(this.uniforms.t, "value").min(-1).max(1).listen();

	
	this.tick = function() {
		TWEEN.update();

		
		this.glrenderer.render(this.scene, this.camera);
		requestAnimationFrame($.proxy(this.tick, this));

	}
	
	// draw!
	this.tick();

});

