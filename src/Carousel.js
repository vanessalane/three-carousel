(function (window) {
  /*
   *
   * 3D Carousel using Three.js and Tween.js
   *
   * @author: Nikos M. http://nikos-web-development.netai.net/
   *
   * https://github.com/foo123/Carousel3
   *
   */

  // local references
  var THREE = window.THREE,
    TWEEN = window.TWEEN;

  var self = function (radius, items, width, height) {
    // call super
    THREE.Object3D.call(this);

    var scope = this;

    this.radius = radius;
    this.width = width;
    this.height = height;
    this.reflectionOpacity = 0;
    this.reflectionHeightPer = 0.4;

    this.items = items;

    var l = this.items.length;
    this.anglePer = l > 0 ? Math.PI / l : 0;

    for (var i = 0; i < l; i++) {
      buildCarousel(scope, i);
    }
  };

  // self is subclass of Object3D
  self.prototype = new THREE.Object3D();

  self.prototype.constructor = self;

  // bring an item to front
  self.prototype.rotateToItem = function (item, callback) {
    var angle,
      b,
      ang,
      thiss = this;

    // find shortest rotation angle (modulo)
    angle = (item.carouselAngle - Math.PI / 2) % (2 * Math.PI);
    b = this.rotation.x % (2 * Math.PI);

    if (b > 0) b = -2 * Math.PI + b;

    this.rotation.x = b;

    if (angle < b) angle += 2 * Math.PI;

    if (angle - b > 2 * Math.PI - (angle - b))
      ang = b + -(2 * Math.PI - (angle - b));
    else ang = b + (angle - b);

    if (ang > 180) {
      this.opacity = 0;
    }

    // tween it
    new TWEEN.Tween(this.rotation)
      .to({ x: ang }, 800)
      .easing(TWEEN.Easing.Exponential.EaseInOut)
      .onComplete(function () {
        if (callback) callback.call(thiss);
      })
      .start();
  };

  // <private> build the carousel when everything is loaded
  function buildCarousel(scope, i) {
    var item = scope.items[i];
    var size,
      text3d,
      textMaterial,
      text,
      textcontainer,
      texture,
      canvas,
      material,
      w = scope.width,
      h = scope.height,
      r = scope.radius,
      anglePer = scope.anglePer,
      aa;

    // text caption
    if (item.label) {
      size = 20;
      text3d = new THREE.TextGeometry(item.label, {
        size,
        height: 0.1,
        curveSegments: 4,
        font: "helvetiker",
      });
      textMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        overdraw: true,
      });
      text = new THREE.Mesh(text3d, textMaterial);
      text.doubleSided = false;
      textcontainer = new THREE.Object3D();
      textcontainer.add(text);
    }

    texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
    });
    textPlane = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 3, 3), material);
    aa = i * anglePer;
    textPlane.rotation.x = aa - Math.PI / 2;
    textPlane.position = new THREE.Vector3(
      0,
      r * Math.cos(aa),
      r * Math.sin(aa)
    );
    textPlane.doubleSided = false;
    textPlane.carouselAngle = aa; //plane.rotation.y;
    textPlane.scale.y = -1;

    if (item.label) {
      // position text caption, relative to image plane
      textcontainer.position.x = textPlane.position.x;
      textcontainer.position.y = textPlane.position.y; // this should be vertical position
      textcontainer.position.z = textPlane.position.z;
      textcontainer.rotation.x = textPlane.rotation.x;
      text.scale.x = textPlane.scale.x;
    }

    canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    // add to the carousel
    scope.add(textPlane);
    if (scope.items[i].label) {
      scope.add(textcontainer);
    }
  }

  // export it
  window.Carousel = self;
})(window);
