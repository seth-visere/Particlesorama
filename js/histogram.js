/**
 * Histogram: Color histogram generation and image analysis code
 * By Joe Turgeon [http://arithmetric.com]
 * Version 2010/05/18
 * Licensed under GPL version 3
 */

var histogram = function () {
  var containerElementId, container, canvasElement, canvasContext, cWidth, cHeight, progressCallback, imageUrl, imageElement, camera, scene, renderer, renderInterval, cameraDistance, halfWindowWidth, halfWindowHeight, cameraX, cameraY, mouseX, mouseY, resultsRGB, resultsColors, resultsCounts;

  function buildCanvas(elementId, width, height, rebuild) {
    if (!canvasElement || !canvasContext || rebuild) {
      if (container) {
        container.empty();
      }
      canvasElement = $('<canvas width="' + width + '" height="' + height + '"></canvas>');
      canvasContext = false;
      cvs = canvasElement.get(0);
      if (cvs) {
        canvasContext = cvs.getContext('2d');
      }
    }
    $('#' + elementId).append(canvasElement);
  }

  function removeCanvas() {
    if (canvasElement) {
      canvasElement.remove();
      canvasElement = false;
      canvasContext = false;
    }
  }

  function pause() {
    if (renderInterval) {
      clearInterval(renderInterval);
      renderInterval = false;
    }
  }

  function unpause() {
    if (camera && scene && renderer && !renderInterval) {
      renderInterval = setInterval(renderLoop, 1000 / 60);
    }
  }

  function recomposeHexPart(v) {
    var part = Number(v).toString(16);
    if (part.length < 2) {
      part = '0' + part;
    }
    return part;
  }

  function scale(w1, h1, w2, h2) {
    return ((w1 / h1) > (w2 / h2)) ? {'width': w2, 'height': h1 / w1 * w2} : {'width': w1 / h1 * h2, 'height': h2};
  }

  function analyzeImage(imageData) {
    var iWidth = imageData.width, iHeight = imageData.height, maxResults = 1200, pixelResolution = 3, rgb, val, r, g, b, hex, x, y, offset, colors, counts, minnum, maxnum, sum, mean, median, norm, i, num, lowspan, highspan;

    // count RGB values for each pixel of the image
    rgb = {};
    colors = [];
    for (y = 0; y < iHeight; y++) {
      for (x = 0; x < iWidth; x++) {
        offset = (y * iWidth + x) * 4;
        // get pixel component values from ImageData
        r = imageData.data[offset];
        g = imageData.data[offset + 1];
        b = imageData.data[offset + 2];
        // reduce resolution of RGB values
        if (pixelResolution > 1) {
          r = r >> pixelResolution << pixelResolution;
          g = g >> pixelResolution << pixelResolution;
          b = b >> pixelResolution << pixelResolution;
        }
        // make hex string
        hex = recomposeHexPart(r) + recomposeHexPart(g) + recomposeHexPart(b);
        // increment color counters
        if (rgb[hex]) {
          rgb[hex].count++;
        }
        else {
          colors.push(hex);
          rgb[hex] = {'count': 1, 'r': r, 'g': g, 'b': b};
        }
      }
    }

    // sort array of colors by counts in reverse order (with highest first)
    colors.sort(function (a, b) {
      return rgb[b].count - rgb[a].count;
    });

    // keep only the top results
    if (colors.length > maxResults) {
      colors.splice(maxResults, colors.length - maxResults);
    }

    // generate summary values
    minnum = maxnum = rgb[colors[0]].count;
    sum = 0;
    num = colors.length;
    for (i = 0; i < num; i++) {
      val = rgb[colors[i]].count;
      if (val < minnum) {
        minnum = val;
      }
      else if (val > maxnum) {
        maxnum = val;
      }
      sum += val;
    }
    mean = sum / num;
    median = rgb[colors[Math.ceil(num / 2)]].count;

    // normalize count values
    norm = median;
    lowspan = norm - minnum || 1;
    highspan = maxnum - norm || 1;
    counts = colors.map(function (key, idx, array) {
      val = rgb[key].count;
      return (val > norm) ? 25 + Math.floor(25 * (val - norm) / highspan) : 25 - Math.floor(25 * (norm - val) / lowspan);
    });

    return {'rgb': rgb, 'colors': colors, 'counts': counts};
  }

  function drawResults() {
    // apply transparent layer to canvas
    canvasContext.fillStyle = 'rgba(51,51,51,0.8)';
    canvasContext.fillRect(0, 0, cWidth, cHeight);

    if (progressCallback) {
      progressCallback(false);
    }

    // initialize 3d rendering system
    renderStart();
  }

  function redraw() {
    if (imageElement.length) {
      image = imageElement.get(0);
      res = scale(image.width, image.height, cWidth - 16, cHeight - 16);
      posx = Math.floor((cWidth - res.width) / 2);
      posy = Math.floor((cHeight - res.height) / 2);
      canvasContext.drawImage(image, posx, posy, res.width, res.height);

      // apply transparent layer to canvas
      canvasContext.fillStyle = 'rgba(51,51,51,0.8)';
      canvasContext.fillRect(0, 0, cWidth, cHeight);

      if (renderer && renderer.setSize && renderer.viewport) {
        renderer.setSize(cWidth, cHeight);
        canvasElement.after(renderer.viewport);
      }
    }
  }

  function imageLoaded(e) {
    var image, iWidth, iHeight, sWidth, sHeight, posx, posy, wrkr, res, packet;

    imageElement.unbind('load');

    if (progressCallback) {
      progressCallback('Generating histogram');
    }

    image = imageElement.get(0);
    if (!image || !image.width || !image.height) {
      imageElement = $('<img src="' + imageElement.attr('src') + '" />').load(imageLoaded);
      return;
    }
    iWidth = image.width;
    iHeight = image.height;

    res = scale(iWidth, iHeight, cWidth - 16, cHeight - 16);
    posx = Math.floor((cWidth - res.width) / 2);
    posy = Math.floor((cHeight - res.height) / 2);
    canvasContext.drawImage(image, posx, posy, res.width, res.height);

    res = scale(iWidth, iHeight, 600, 600);
    sWidth = parseInt(res.width, 10);
    sHeight = parseInt(res.height, 10);
    bufferElement = $('<canvas width="' + sWidth + '" height="' + sHeight + '"></canvas>');
    bufferContext = bufferElement.get(0).getContext('2d');
    bufferContext.drawImage(image, 0, 0, sWidth, sHeight);
    imageData = bufferContext.getImageData(0, 0, sWidth, sHeight);

    if (Worker) {
      wrkr = new Worker('js/histogram-worker.js');
      wrkr.onmessage = function (e) {
        res = {};
        if (typeof e.data == 'string') {
          res = JSON.parse(e.data);
        }
        else {
          res = e.data;
        }
        if (res.type == 'debug') {
          console.log(res.message);
        }
        else if (res.type == 'object-test') {
          packet = {'type': 'imagedata', 'imageData': {'data': imageData.data, 'width': imageData.width, 'height': imageData.height}};
          if (res.result) {
            packet = JSON.stringify(packet);
          }
          wrkr.postMessage(packet);
        }
        else if (res.type == 'progress' && progressCallback) {
          progressCallback(res.message);
        }
        else if (res.rgb && res.colors && res.counts) {
          resultsRGB = res.rgb;
          resultsColors = res.colors;
          resultsCounts = res.counts;
          drawResults();
        }
      };
      // test whether Worker.postMessage automatically converts data to JSON
      wrkr.postMessage({'type': 'object-test'});
    }
    else {
      res = analyzeImage(imageData);
      resultsRGB = res.rgb;
      resultsColors = res.colors;
      resultsCounts = res.counts;
      drawResults();
    }
  }

  function renderStart() {
    var particle, size;

    cameraDistance = 768;
    camera = new THREE.Camera(0, 0, cameraDistance);
    scene = new THREE.Scene();
    renderer = new THREE.CanvasRenderer();
    renderer.setSize(cWidth, cHeight);

/*
    num = resultsCounts.length;
    sum = cWidth / 25;
    for (i = 0; i < num; i++) {
      size = resultsCounts[i] / 10;
      particle = new Particle(new ColorMaterial(parseInt(resultsColors[i], 16)));
      particle.size = size;
      particle.position.x = (resultsRGB[resultsColors[i]].r - 128) * 2;
      particle.position.y = (resultsRGB[resultsColors[i]].g - 128) * 2;
      particle.position.z = (resultsRGB[resultsColors[i]].b - 128) * 2;
      particle.updateMatrix();
      scene.add(particle);
    }
*/

    for (i = 0; i < 32; i++) {
      particle = new THREE.Particle(new THREE.ColorFillMaterial((i * 8) << 16, 0.72));
      particle.size = 1;
      particle.position.x = (i * 16) - 256;
      particle.position.y = -256;
      particle.position.z = -256;
      particle.updateMatrix();
      scene.add(particle);
    }

    for (i = 0; i < 32; i++) {
      particle = new THREE.Particle(new THREE.ColorFillMaterial((i * 8) << 8, 0.72));
      particle.size = 1;
      particle.position.y = (i * 16) - 256;
      particle.position.x = -256;
      particle.position.z = -256;
      particle.updateMatrix();
      scene.add(particle);
    }

    for (i = 0; i < 32; i++) {
      particle = new THREE.Particle(new THREE.ColorFillMaterial(i * 8, 0.72));
      particle.size = 1;
      particle.position.z = (i * 16) - 256;
      particle.position.x = -256;
      particle.position.y = -256;
      particle.updateMatrix();
      scene.add(particle);
    }

    canvasElement.after(renderer.domElement);

    halfWindowWidth = window.innerWidth / 2;
    halfWindowHeight = window.innerHeight / 2;
    mouseX = mouseY = 0.1;
    cameraX = cameraY = 0;
    mouseYDir = 1;
    document.addEventListener('mousemove', renderMouseMove, false);
    document.addEventListener('click', renderMouseMove, false);
    if (renderInterval) {
      clearInterval(renderInterval);
    }
    renderInterval = setInterval(renderLoop, 1000 / 60);
  }

  function renderLoop() {
    var count = 0, color, size, particle;
    while (resultsColors.length) {
      color = resultsColors.shift();
      size = resultsCounts.shift() / 10;
      particle = new THREE.Particle(new THREE.ColorFillMaterial(parseInt(color, 16), 1));
      particle.size = size;
      particle.position.x = (resultsRGB[color].r - 128) * 2;
      particle.position.y = (resultsRGB[color].g - 128) * 2;
      particle.position.z = (resultsRGB[color].b - 128) * 2;
      particle.updateMatrix();
      scene.add(particle);
      count++;
      if (count == 5) {
        break;
      }
    }

    cameraX += mouseX * Math.PI / 180;
    cameraY -= mouseY * Math.PI / 180;
    camera.position.x = cameraDistance * Math.sin(cameraX) * Math.cos(cameraY);
    camera.position.y = cameraDistance * Math.sin(cameraX) * Math.sin(cameraY);
    camera.position.z = cameraDistance * Math.cos(cameraX);
    camera.updateMatrix();
    renderer.render(scene, camera);
  }

  function renderMouseMove(event) {
    mouseX = (event.clientX - halfWindowWidth) / halfWindowWidth;
    mouseY = (event.clientY - halfWindowHeight) / halfWindowHeight;
  }

  function generate(elementId, image, width, height, callback) {
    var iel, img;

    // check and process arguments
    containerElementId = elementId;
    container = $('#' + containerElementId);
    if (!container || container.length !== 1) {
      return false;
    }
    imageUrl = image;
    cWidth = parseInt(width, 10) || 400;
    cHeight = parseInt(height, 10) || 300;
    progressCallback = callback;

    // prepare the canvas
    buildCanvas(containerElementId, cWidth, cHeight, true);

    // load the image
    imageElement = $('<img src="' + image + '" />').load(imageLoaded);
  }

  function resize(w, h) {
    newWidth = parseInt(w, 10);
    newHeight = parseInt(h, 10);
    if (newWidth && newHeight && containerElementId) {
      pause();
      cWidth = newWidth;
      cHeight = newHeight;
      buildCanvas(containerElementId, newWidth, newHeight, true);
      redraw();
      unpause();
    }
  }

  return {
    analyzeImage: analyzeImage,
    generate: generate,
    pause: pause,
    resize: resize,
    unpause: unpause
  };
}();
