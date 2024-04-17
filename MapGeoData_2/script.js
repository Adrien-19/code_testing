let geojson;

function preload() {
  geojson = loadJSON('data/Basel_AWB24.geojson');
}

let particles = [];

function Particle(x, y) {
  this.x = x;
  this.y = y;
  this.vx = random(-1, 1);
  this.vy = random(-1, 1);

  this.update = function() {
    this.x += this.vx;
    this.y += this.vy;

    // Check if particle is within the bounds of the canvas
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.x = random(width);
      this.y = random(height);
    }

    // Check if particle is close to any location points
    geojson.features.forEach(feature => {
      let coords = feature.geometry.coordinates;
      let locX = map(coords[0], 7.58, 7.62, 0, width);
      let locY = map(coords[1], 47.52, 47.58, height, 0);

      let d = dist(this.x, this.y, locX, locY);
      if (d < 100) { // Increase the distance threshold to enlarge the zone of influence
        // Apply magnetic force towards the location point
        let forceX = locX - this.x;
        let forceY = locY - this.y;
        this.vx += forceX * 0.0001;
        this.vy += forceY * 0.0001;
      }
    });

    // Check if particle is close to other particles
    particles.forEach(particle => {
      if (particle !== this) {
        let d = dist(this.x, this.y, particle.x, particle.y);
        if (d < 50) { // Increase the distance threshold to control the repulsion strength
          // Apply repulsive force away from the other particle
          let forceX = this.x - particle.x;
          let forceY = this.y - particle.y;
          this.vx += forceX * 0.0001;
          this.vy += forceY * 0.0001;
        }
      }
    });
  }


  this.display = function() {
    circle(this.x, this.y, 10);
  }
}

function setup() {
  createCanvas(800, 800);

  // Create initial particles
  for (let i = 0; i < 50; i++) {
    let x = random(width);
    let y = random(height);
    particles.push(new Particle(x, y));
  }
}

function draw() {
  background(255);
  geojson.features.forEach(feature => {
    let coords = feature.geometry.coordinates;
    let x = map(coords[0], 7.58, 7.62, 0, width); // Convert longitude to x position
    let y = map(coords[1], 47.52, 47.58, height, 0); // Convert latitude to y position
    noStroke();
    fill(255,0,0,50);
    circle(x, y, 200);
    fill(0); // Draw a circle at the position to represent the magnetic influence zone
    circle(x, y, 10); // Draw a circle at the position
    stroke(0);
    fill(255);
    // Update and display particles
    particles.forEach(particle => {
      particle.update();
      particle.display();
    });
  });
}
